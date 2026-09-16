import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

interface CreateIncomeInput {
  userId: string;
  amount: number;
  source: string;
  type?: string;
  date: string;
  description?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export class IncomeService {
  async create(input: CreateIncomeInput) {
    return prisma.income.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        source: input.source,
        type: input.type || 'one-time',
        date: new Date(input.date),
        description: input.description || '',
        isRecurring: input.isRecurring || false,
        recurrencePattern: input.recurrencePattern,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.income.count({ where: { userId } }),
    ]);

    return {
      incomes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, userId: string) {
    const income = await prisma.income.findFirst({ where: { id, userId } });
    if (!income) throw ApiError.notFound('Income not found');
    return income;
  }

  async update(id: string, userId: string, data: Partial<CreateIncomeInput>) {
    const income = await prisma.income.findFirst({ where: { id, userId } });
    if (!income) throw ApiError.notFound('Income not found');

    return prisma.income.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.source && { source: data.source }),
        ...(data.type && { type: data.type }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.recurrencePattern !== undefined && { recurrencePattern: data.recurrencePattern }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const income = await prisma.income.findFirst({ where: { id, userId } });
    if (!income) throw ApiError.notFound('Income not found');
    await prisma.income.delete({ where: { id } });
    return { message: 'Income deleted successfully' };
  }

  async getMonthlyTotal(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    return incomes.reduce((sum, i) => sum + i.amount, 0);
  }

  async getSourceBreakdown(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const incomes = await prisma.income.findMany({ where });
    const breakdown: Record<string, number> = {};
    let total = 0;

    for (const income of incomes) {
      breakdown[income.source] = (breakdown[income.source] || 0) + income.amount;
      total += income.amount;
    }

    return { breakdown, total };
  }
}

export const incomeService = new IncomeService();

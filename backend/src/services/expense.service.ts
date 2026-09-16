import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import { safeParseJson } from '../utils/json.utils';
import { notificationService } from './notification.service';

interface CreateExpenseInput {
  userId: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
  description?: string;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  receiptUrl?: string;
}

interface ExpenseFilters {
  userId: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ExpenseService {
  async create(input: CreateExpenseInput) {
    const expense = await prisma.expense.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        category: input.category,
        date: new Date(input.date),
        paymentMethod: input.paymentMethod || 'cash',
        description: input.description || '',
        tags: JSON.stringify(input.tags || []),
        notes: input.notes || '',
        isRecurring: input.isRecurring || false,
        recurrencePattern: input.recurrencePattern,
        receiptUrl: input.receiptUrl,
      },
    });

    // Check budget alerts asynchronously
    notificationService.checkBudgetAlerts(input.userId).catch(() => {});

    return {
      ...expense,
      tags: safeParseJson(expense.tags, []),
    };
  }

  async findAll(filters: ExpenseFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId: filters.userId };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.search) {
      where.description = { contains: filters.search };
    }

    const orderBy: any = {};
    orderBy[filters.sortBy || 'date'] = filters.sortOrder || 'desc';

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses: expenses.map(e => ({
        ...e,
        tags: safeParseJson(e.tags, []),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    return {
      ...expense,
      tags: safeParseJson(expense.tags, []),
    };
  }

  async update(id: string, userId: string, data: Partial<CreateExpenseInput>) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.recurrencePattern !== undefined && { recurrencePattern: data.recurrencePattern }),
      },
    });

    // Check budget alerts asynchronously
    notificationService.checkBudgetAlerts(userId).catch(() => {});

    return {
      ...updated,
      tags: safeParseJson(updated.tags, []),
    };
  }

  async delete(id: string, userId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    await prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
  }

  async getCategoryBreakdown(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({ where });
    
    const breakdown: Record<string, { total: number; count: number; percentage: number }> = {};
    let grandTotal = 0;

    for (const expense of expenses) {
      if (!breakdown[expense.category]) {
        breakdown[expense.category] = { total: 0, count: 0, percentage: 0 };
      }
      breakdown[expense.category].total += expense.amount;
      breakdown[expense.category].count += 1;
      grandTotal += expense.amount;
    }

    // Calculate percentages
    for (const category in breakdown) {
      breakdown[category].percentage = grandTotal > 0 
        ? Math.round((breakdown[category].total / grandTotal) * 100) 
        : 0;
    }

    return { breakdown, grandTotal };
  }

  async getMonthlyTrend(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, number> = {};
    
    for (const expense of expenses) {
      const key = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + expense.amount;
    }

    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total: Math.round(total * 100) / 100,
    }));
  }
}

export const expenseService = new ExpenseService();

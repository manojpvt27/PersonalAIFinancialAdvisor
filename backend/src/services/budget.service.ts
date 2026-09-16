import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

interface CreateBudgetInput {
  userId: string;
  category: string;
  limitAmount: number;
  period?: string;
  startDate: string;
  endDate: string;
  alertEnabled?: boolean;
  alertThreshold?: number;
}

export class BudgetService {
  async create(input: CreateBudgetInput) {
    // Check for existing budget in same category and period
    const existing = await prisma.budget.findFirst({
      where: {
        userId: input.userId,
        category: input.category,
        startDate: { lte: new Date(input.endDate) },
        endDate: { gte: new Date(input.startDate) },
      },
    });

    if (existing) {
      throw ApiError.conflict('Budget already exists for this category and period');
    }

    return prisma.budget.create({
      data: {
        userId: input.userId,
        category: input.category,
        limitAmount: input.limitAmount,
        period: input.period || 'monthly',
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        alertEnabled: input.alertEnabled ?? true,
        alertThreshold: input.alertThreshold ?? 80,
      },
    });
  }

  async findAll(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(userId, budget.category, budget.startDate, budget.endDate);
        const percentage = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;
        
        return {
          ...budget,
          spentAmount: Math.round(spent * 100) / 100,
          percentage,
          status: percentage >= 100 ? 'exceeded' : percentage >= budget.alertThreshold ? 'warning' : 'on_track',
          remaining: Math.round((budget.limitAmount - spent) * 100) / 100,
        };
      })
    );

    return budgetsWithSpent;
  }

  async findById(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw ApiError.notFound('Budget not found');

    const spent = await this.calculateSpent(userId, budget.category, budget.startDate, budget.endDate);
    const percentage = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;

    return {
      ...budget,
      spentAmount: Math.round(spent * 100) / 100,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= budget.alertThreshold ? 'warning' : 'on_track',
      remaining: Math.round((budget.limitAmount - spent) * 100) / 100,
    };
  }

  async update(id: string, userId: string, data: Partial<CreateBudgetInput>) {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw ApiError.notFound('Budget not found');

    return prisma.budget.update({
      where: { id },
      data: {
        ...(data.limitAmount !== undefined && { limitAmount: data.limitAmount }),
        ...(data.category && { category: data.category }),
        ...(data.period && { period: data.period }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.alertEnabled !== undefined && { alertEnabled: data.alertEnabled }),
        ...(data.alertThreshold !== undefined && { alertThreshold: data.alertThreshold }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw ApiError.notFound('Budget not found');
    await prisma.budget.delete({ where: { id } });
    return { message: 'Budget deleted successfully' };
  }

  private async calculateSpent(userId: string, category: string, startDate: Date, endDate: Date): Promise<number> {
    const where: any = {
      userId,
      date: { gte: startDate, lte: endDate },
    };

    if (category !== 'overall') {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({ where });
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }
}

export const budgetService = new BudgetService();

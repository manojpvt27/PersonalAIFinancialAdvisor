import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

interface CreateGoalInput {
  userId: string;
  name: string;
  type: string;
  targetAmount: number;
  targetDate: string;
  icon?: string;
  color?: string;
}

export class GoalService {
  async create(input: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        userId: input.userId,
        name: input.name,
        type: input.type,
        targetAmount: input.targetAmount,
        targetDate: new Date(input.targetDate),
        icon: input.icon || '🎯',
        color: input.color || '#14B8A6',
      },
    });
  }

  async findAll(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map(goal => {
      const percentage = goal.targetAmount > 0
        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
        : 0;
      
      const daysRemaining = Math.ceil(
        (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      const monthsRemaining = Math.max(0.5, daysRemaining / 30);
      const monthlyRequired = (remainingAmount > 0 && daysRemaining > 0)
        ? Math.round((remainingAmount / monthsRemaining) * 100) / 100
        : 0;

      return {
        ...goal,
        percentage,
        daysRemaining: Math.max(0, daysRemaining),
        monthlyRequired,
        isOnTrack: percentage >= Math.max(0, 100 - (daysRemaining / (365 / 100))),
      };
    });
  }

  async findById(id: string, userId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) throw ApiError.notFound('Goal not found');
    return goal;
  }

  async update(id: string, userId: string, data: Partial<CreateGoalInput & { status: string }>) {
    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw ApiError.notFound('Goal not found');

    return prisma.goal.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw ApiError.notFound('Goal not found');
    await prisma.goal.delete({ where: { id } });
    return { message: 'Goal deleted successfully' };
  }

  async addContribution(goalId: string, userId: string, amount: number, note?: string) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) throw ApiError.notFound('Goal not found');

    const [contribution] = await Promise.all([
      prisma.goalContribution.create({
        data: { goalId, amount, note: note || '' },
      }),
      prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
          ...(goal.currentAmount + amount >= goal.targetAmount && { status: 'completed' }),
        },
      }),
    ]);

    return contribution;
  }
}

export const goalService = new GoalService();

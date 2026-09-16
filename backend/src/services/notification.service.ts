import prisma from '../config/database';
import { safeParseJson } from '../utils/json.utils';

export class NotificationService {
  async create(userId: string, type: string, title: string, message: string, data?: any) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: JSON.stringify(data || {}),
      },
    });
  }

  async findAll(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map(n => ({
      ...n,
      data: safeParseJson(n.data, {}),
    }));
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string, userId: string) {
    await prisma.notification.deleteMany({
      where: { id, userId },
    });
    return { message: 'Notification deleted' };
  }

  /**
   * Check budgets and create alerts
   */
  async checkBudgetAlerts(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId, alertEnabled: true },
    });

    for (const budget of budgets) {
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          ...(budget.category !== 'overall' && { category: budget.category }),
          date: { gte: budget.startDate, lte: budget.endDate },
        },
      });

      const spent = expenses.reduce((s, e) => s + e.amount, 0);
      const percentage = Math.round((spent / budget.limitAmount) * 100);

      if (percentage >= 100) {
        await this.create(
          userId,
          'overspending',
          `Budget Exceeded: ${budget.category}`,
          `You've exceeded your ${budget.category} budget by ₹${Math.round(spent - budget.limitAmount)}. Total spent: ₹${Math.round(spent)}.`,
          { budgetId: budget.id, percentage }
        );
      } else if (percentage >= budget.alertThreshold) {
        await this.create(
          userId,
          'budget_alert',
          `Budget Warning: ${budget.category}`,
          `You've used ${percentage}% of your ${budget.category} budget (₹${Math.round(spent)} of ₹${budget.limitAmount}).`,
          { budgetId: budget.id, percentage }
        );
      }
    }
  }
}

export const notificationService = new NotificationService();

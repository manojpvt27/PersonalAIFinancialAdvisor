import prisma from '../config/database';
import { safeParseJson } from '../utils/json.utils';
import { expenseService } from './expense.service';
import { incomeService } from './income.service';
import { budgetService } from './budget.service';

export class AnalyticsService {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month expenses
    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Last month expenses (for comparison)
    const lastMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // Current month income
    const currentMonthIncomes = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Last month income
    const lastMonthIncomes = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    const monthlyExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthExpense = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const lastMonthIncome = lastMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const savings = monthlyIncome - monthlyExpense;
    const netCashFlow = savings;

    // Calculate trends (percentage change)
    const expenseTrend = lastMonthExpense > 0
      ? Math.round(((monthlyExpense - lastMonthExpense) / lastMonthExpense) * 100)
      : 0;
    const incomeTrend = lastMonthIncome > 0
      ? Math.round(((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100)
      : 0;

    // Total balance (all-time income - all-time expenses)
    const allExpenses = await prisma.expense.findMany({ where: { userId } });
    const allIncomes = await prisma.income.findMany({ where: { userId } });
    const totalBalance = allIncomes.reduce((s, i) => s + i.amount, 0) - allExpenses.reduce((s, e) => s + e.amount, 0);

    // Recent transactions
    const recentTransactions = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Category breakdown for current month
    const categoryBreakdown: Record<string, number> = {};
    for (const expense of currentMonthExpenses) {
      categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
    }

    return {
      totalBalance: Math.round(totalBalance * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpense: Math.round(monthlyExpense * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      netCashFlow: Math.round(netCashFlow * 100) / 100,
      expenseTrend,
      incomeTrend,
      categoryBreakdown,
      recentTransactions: recentTransactions.map(t => ({
        ...t,
        tags: safeParseJson(t.tags, []),
      })),
    };
  }

  /**
   * Calculate financial health score (0-100)
   */
  async getHealthScore(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [expenses, incomes, budgets, goals] = await Promise.all([
      prisma.expense.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.income.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      budgetService.findAll(userId),
      prisma.goal.findMany({ where: { userId } }),
    ]);

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

    // 1. Savings Rate (25 points) - Target: 20%+ savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const savingsScore = Math.min(25, Math.round((savingsRate / 20) * 25));

    // 2. Spending Efficiency (20 points) - Diversified spending, no single category > 40%
    const categorySpending: Record<string, number> = {};
    for (const e of expenses) {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    }
    const maxCategoryPercentage = totalExpense > 0
      ? Math.max(...Object.values(categorySpending).map(v => (v / totalExpense) * 100), 0)
      : 0;
    const efficiencyScore = maxCategoryPercentage <= 40 ? 20 : Math.max(0, Math.round(20 - (maxCategoryPercentage - 40) / 3));

    // 3. Budget Compliance (20 points)
    const budgetsOnTrack = budgets.filter((b: any) => b.status === 'on_track').length;
    const totalBudgets = budgets.length;
    const budgetScore = totalBudgets > 0 
      ? Math.round((budgetsOnTrack / totalBudgets) * 20) 
      : 15; // Default if no budgets set

    // 4. Emergency Fund Status (20 points) - Target: 3 months expenses
    const monthlyAvgExpense = totalExpense || 10000; // Assume base if no data
    const emergencyGoal = goals.find(g => g.type === 'emergency_fund');
    const emergencyFundMonths = emergencyGoal 
      ? emergencyGoal.currentAmount / monthlyAvgExpense 
      : 0;
    const emergencyScore = Math.min(20, Math.round((emergencyFundMonths / 3) * 20));

    // 5. Debt Ratio (15 points) - Lower is better
    // Since we don't track debt separately, give full score
    const debtScore = 15;

    const totalScore = savingsScore + efficiencyScore + budgetScore + emergencyScore + debtScore;

    const grade = totalScore >= 80 ? 'Excellent' : totalScore >= 60 ? 'Good' : totalScore >= 40 ? 'Fair' : 'Poor';

    const suggestions: string[] = [];
    if (savingsScore < 15) suggestions.push('Try to save at least 20% of your income');
    if (efficiencyScore < 15) suggestions.push('Diversify your spending - avoid over-concentrating in one category');
    if (budgetScore < 15) suggestions.push('Set and follow monthly budgets for better control');
    if (emergencyScore < 15) suggestions.push('Build an emergency fund covering 3 months of expenses');

    return {
      score: totalScore,
      grade,
      breakdown: {
        savingsRate: { score: savingsScore, maxScore: 25, detail: `${Math.round(savingsRate)}% savings rate` },
        spendingEfficiency: { score: efficiencyScore, maxScore: 20, detail: `Max category: ${Math.round(maxCategoryPercentage)}%` },
        budgetCompliance: { score: budgetScore, maxScore: 20, detail: `${budgetsOnTrack}/${totalBudgets} budgets on track` },
        emergencyFund: { score: emergencyScore, maxScore: 20, detail: `${Math.round(emergencyFundMonths * 10) / 10} months covered` },
        debtRatio: { score: debtScore, maxScore: 15, detail: 'No debt tracked' },
      },
      suggestions,
    };
  }

  /**
   * Get spending trends over time
   */
  async getSpendingTrends(userId: string, months = 12) {
    return expenseService.getMonthlyTrend(userId, months);
  }

  /**
   * Get category-wise spending comparison
   */
  async getCategoryComparison(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentBreakdown, lastBreakdown] = await Promise.all([
      expenseService.getCategoryBreakdown(userId, startOfMonth.toISOString()),
      expenseService.getCategoryBreakdown(userId, startOfLastMonth.toISOString(), endOfLastMonth.toISOString()),
    ]);

    const categories = new Set([
      ...Object.keys(currentBreakdown.breakdown),
      ...Object.keys(lastBreakdown.breakdown),
    ]);

    const comparison = Array.from(categories).map(category => {
      const current = currentBreakdown.breakdown[category]?.total || 0;
      const previous = lastBreakdown.breakdown[category]?.total || 0;
      const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

      return { category, current, previous, change };
    });

    return comparison;
  }
}

export const analyticsService = new AnalyticsService();

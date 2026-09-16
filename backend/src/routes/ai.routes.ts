import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { analyticsService } from '../services/analytics.service';
import { config } from '../config';

const router = Router();
router.use(authenticate);

async function callGeminiApi(
  message: string,
  stats: any,
  healthScore: any,
  budgets: any[],
  recentExpenses: any[]
): Promise<string | null> {
  const apiKey = config.ai.geminiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are FinAI, an expert personal AI financial advisor.
User Financial Context:
- Monthly Income: ₹${stats.monthlyIncome}
- Monthly Expenses: ₹${stats.monthlyExpense}
- Net Savings: ₹${stats.savings}
- Health Score: ${healthScore.score}/100 (${healthScore.grade})
- Category Breakdown: ${JSON.stringify(stats.categoryBreakdown)}
- Recent Budgets: ${JSON.stringify(budgets.map((b: any) => ({ category: b.category, limit: b.limitAmount, spent: b.spentAmount })))}

User Query: "${message}"

Provide clear, professional, empathetic, and actionable financial guidance using markdown tables, bullet points, and key takeaways where helpful.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) return null;
    const data: any = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch {
    return null;
  }
}

// POST /api/ai/chat - Chat with AI financial advisor
router.post('/chat', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        userId: req.user!.id,
        role: 'user',
        content: message,
      },
    });

    // Get user's financial context
    const dashboardStats = await analyticsService.getDashboardStats(req.user!.id);
    const healthScore = await analyticsService.getHealthScore(req.user!.id);

    // Get budget data for richer context
    let budgets: any[] = [];
    try {
      budgets = await prisma.budget.findMany({
        where: { userId: req.user!.id },
      });
    } catch { /* non-critical */ }

    // Get recent expenses for anomaly detection
    let recentExpenses: any[] = [];
    try {
      recentExpenses = await prisma.expense.findMany({
        where: { userId: req.user!.id },
        orderBy: { date: 'desc' },
        take: 30,
      });
    } catch { /* non-critical */ }

    // Build AI response based on user's data (Try Gemini API first, then smart rules fallback)
    let aiResponse = await callGeminiApi(message, dashboardStats, healthScore, budgets, recentExpenses);
    if (!aiResponse) {
      aiResponse = generateSmartResponse(message, dashboardStats, healthScore, budgets, recentExpenses);
    }

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        userId: req.user!.id,
        role: 'assistant',
        content: aiResponse,
      },
    });

    res.json({ response: aiResponse });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/chat/history
router.get('/chat/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/insights - Get AI-generated spending insights
router.get('/insights', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboardStats = await analyticsService.getDashboardStats(req.user!.id);
    const healthScore = await analyticsService.getHealthScore(req.user!.id);
    const comparison = await analyticsService.getCategoryComparison(req.user!.id);

    const insights: string[] = [];

    // Generate insights based on data
    if (dashboardStats.expenseTrend > 10) {
      insights.push(`⚠️ Your expenses increased by ${dashboardStats.expenseTrend}% compared to last month. Consider reviewing your spending.`);
    } else if (dashboardStats.expenseTrend < -10) {
      insights.push(`✅ Great job! Your expenses decreased by ${Math.abs(dashboardStats.expenseTrend)}% compared to last month.`);
    }

    if (dashboardStats.savings < 0) {
      insights.push(`🔴 You're spending more than you earn this month. Your net cash flow is ₹${dashboardStats.netCashFlow}.`);
    } else if (dashboardStats.monthlyIncome > 0) {
      const savingsRate = Math.round((dashboardStats.savings / dashboardStats.monthlyIncome) * 100);
      if (savingsRate >= 20) {
        insights.push(`💰 Excellent savings rate of ${savingsRate}%! You're on track for financial health.`);
      } else {
        insights.push(`💡 Your savings rate is ${savingsRate}%. Try to aim for at least 20% for better financial health.`);
      }
    }

    // Category-specific insights
    for (const cat of comparison) {
      if (cat.change > 20) {
        insights.push(`📈 ${cat.category} spending increased by ${cat.change}% this month (₹${Math.round(cat.current)}).`);
      } else if (cat.change < -20) {
        insights.push(`📉 ${cat.category} spending decreased by ${Math.abs(cat.change)}% this month. Well done!`);
      }
    }

    // Health score insight
    insights.push(`🏥 Your Financial Health Score is ${healthScore.score}/100 (${healthScore.grade}).`);
    
    for (const suggestion of healthScore.suggestions) {
      insights.push(`💡 ${suggestion}`);
    }

    // Spending anomaly insights
    if (dashboardStats.monthlyExpense > 0 && dashboardStats.monthlyIncome > 0) {
      const expenseRatio = dashboardStats.monthlyExpense / dashboardStats.monthlyIncome;
      if (expenseRatio > 0.9) {
        insights.push(`🚨 You're spending ${Math.round(expenseRatio * 100)}% of your income. Critical: reduce non-essential spending immediately.`);
      } else if (expenseRatio > 0.7) {
        insights.push(`⚡ ${Math.round(expenseRatio * 100)}% of your income goes to expenses. Aim to bring this below 70%.`);
      }
    }

    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/recommendations
router.get('/recommendations', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboardStats = await analyticsService.getDashboardStats(req.user!.id);
    const recommendations: Array<{ title: string; description: string; impact: string; priority: string }> = [];

    // Analyze top spending categories
    const categories = Object.entries(dashboardStats.categoryBreakdown)
      .sort(([, a], [, b]) => (b as number) - (a as number));

    if (categories.length > 0) {
      const [topCategory, topAmount] = categories[0];
      recommendations.push({
        title: `Reduce ${topCategory} spending`,
        description: `${topCategory} is your highest expense at ₹${Math.round(topAmount as number)}. Try reducing it by 10% to save ₹${Math.round((topAmount as number) * 0.1)}/month.`,
        impact: `Save ₹${Math.round((topAmount as number) * 0.1 * 12)}/year`,
        priority: 'high',
      });
    }

    if (dashboardStats.monthlyIncome > 0 && dashboardStats.savings < dashboardStats.monthlyIncome * 0.2) {
      recommendations.push({
        title: 'Increase your savings rate',
        description: 'Financial experts recommend saving at least 20% of your income. Consider automating transfers to a savings account.',
        impact: `Target: ₹${Math.round(dashboardStats.monthlyIncome * 0.2)}/month`,
        priority: 'high',
      });
    }

    recommendations.push({
      title: 'Build an emergency fund',
      description: `Aim for 3-6 months of expenses (₹${Math.round(dashboardStats.monthlyExpense * 3)} - ₹${Math.round(dashboardStats.monthlyExpense * 6)}) in a liquid fund.`,
      impact: 'Financial security buffer',
      priority: 'medium',
    });

    recommendations.push({
      title: 'Start investing early',
      description: `If you can invest ₹${Math.round(dashboardStats.savings * 0.5)}/month, you could grow it significantly with compound interest.`,
      impact: 'Long-term wealth building',
      priority: 'medium',
    });

    // Additional smart recommendations
    if (categories.length > 1) {
      const subscriptions = categories.find(([cat]) => cat === 'subscriptions');
      if (subscriptions && (subscriptions[1] as number) > 500) {
        recommendations.push({
          title: 'Audit your subscriptions',
          description: `You're spending ₹${Math.round(subscriptions[1] as number)}/month on subscriptions. Review and cancel any you don't actively use.`,
          impact: `Potential saving: ₹${Math.round((subscriptions[1] as number) * 0.3)}/month`,
          priority: 'medium',
        });
      }
    }

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// INTELLIGENT RESPONSE GENERATOR
// Multi-topic parsing, trend analysis, anomaly detection
// ============================================================

interface FinancialContext {
  stats: any;
  healthScore: any;
  budgets: any[];
  recentExpenses: any[];
}

function detectTopics(message: string): string[] {
  const lowerMsg = message.toLowerCase();
  const topics: string[] = [];

  if (lowerMsg.includes('save') || lowerMsg.includes('saving') || lowerMsg.includes('cut') || lowerMsg.includes('reduce')) {
    topics.push('savings');
  }
  if (lowerMsg.includes('expense') || lowerMsg.includes('spend') || lowerMsg.includes('breakdown') || lowerMsg.includes('where')) {
    topics.push('expenses');
  }
  if (lowerMsg.includes('budget')) {
    topics.push('budget');
  }
  if (lowerMsg.includes('invest') || lowerMsg.includes('sip') || lowerMsg.includes('mutual fund') || lowerMsg.includes('stock')) {
    topics.push('invest');
  }
  if (lowerMsg.includes('health') || lowerMsg.includes('score') || lowerMsg.includes('how am i doing') || lowerMsg.includes('overview')) {
    topics.push('health');
  }
  if (lowerMsg.includes('income') || lowerMsg.includes('earn') || lowerMsg.includes('salary')) {
    topics.push('income');
  }
  if (lowerMsg.includes('forecast') || lowerMsg.includes('predict') || lowerMsg.includes('next month') || lowerMsg.includes('future')) {
    topics.push('forecast');
  }
  if (lowerMsg.includes('compare') || lowerMsg.includes('vs') || lowerMsg.includes('versus') || lowerMsg.includes('difference')) {
    topics.push('compare');
  }
  if (lowerMsg.includes('emergency') || lowerMsg.includes('backup') || lowerMsg.includes('safety net')) {
    topics.push('emergency');
  }
  if (lowerMsg.includes('debt') || lowerMsg.includes('loan') || lowerMsg.includes('emi') || lowerMsg.includes('credit')) {
    topics.push('debt');
  }
  if (lowerMsg.includes('tip') || lowerMsg.includes('advice') || lowerMsg.includes('suggest') || lowerMsg.includes('recommend')) {
    topics.push('tips');
  }
  if (lowerMsg.includes('goal') || lowerMsg.includes('target') || lowerMsg.includes('plan')) {
    topics.push('goals');
  }

  // Default if nothing matched
  if (topics.length === 0) topics.push('overview');

  return topics;
}

function getSeasonalAdvice(): string {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) {
    return '\n\n🗓️ **Seasonal Tip**: Tax season is around the corner. Make sure to organize your investment proofs (80C, 80D) and file your returns on time to maximize deductions.';
  } else if (month >= 3 && month <= 5) {
    return '\n\n🗓️ **Seasonal Tip**: New financial year! Great time to review and reset your budgets, rebalance your investment portfolio, and set fresh savings goals.';
  } else if (month >= 9 && month <= 11) {
    return '\n\n🗓️ **Seasonal Tip**: Festival & holiday season ahead. Set aside a separate entertainment budget to avoid overspending on gifts and celebrations.';
  }
  return '';
}

function detectAnomalies(recentExpenses: any[]): string[] {
  const anomalies: string[] = [];
  if (!recentExpenses || recentExpenses.length < 5) return anomalies;

  // Group by category and find unusually high transactions
  const categoryTotals: Record<string, { total: number; count: number; max: number }> = {};
  for (const exp of recentExpenses) {
    const cat = exp.category || 'others';
    if (!categoryTotals[cat]) categoryTotals[cat] = { total: 0, count: 0, max: 0 };
    categoryTotals[cat].total += exp.amount;
    categoryTotals[cat].count++;
    categoryTotals[cat].max = Math.max(categoryTotals[cat].max, exp.amount);
  }

  for (const [cat, data] of Object.entries(categoryTotals)) {
    const avg = data.total / data.count;
    if (data.max > avg * 2.5 && data.count >= 3) {
      anomalies.push(`⚡ **Unusual spike detected** in **${cat}**: A single transaction of ₹${Math.round(data.max)} is ${Math.round(data.max / avg)}x your average (₹${Math.round(avg)}).`);
    }
  }

  return anomalies;
}

function generateSavingsResponse(stats: any): string {
  const savingsRate = stats.monthlyIncome > 0
    ? Math.round((stats.savings / stats.monthlyIncome) * 100)
    : 0;

  let response = `## 💰 Savings Analysis\n\n`;
  response += `| Metric | Amount |\n|--------|--------|\n`;
  response += `| Monthly Income | ₹${stats.monthlyIncome.toLocaleString('en-IN')} |\n`;
  response += `| Monthly Expenses | ₹${stats.monthlyExpense.toLocaleString('en-IN')} |\n`;
  response += `| Current Savings | ₹${stats.savings.toLocaleString('en-IN')} |\n`;
  response += `| Savings Rate | ${savingsRate}% |\n\n`;

  if (savingsRate >= 30) {
    response += `✅ **Outstanding!** You're saving more than 30% — you're in the top tier of savers.\n\n`;
  } else if (savingsRate >= 20) {
    response += `👍 **Good job!** You're hitting the recommended 20% savings threshold.\n\n`;
  } else if (savingsRate >= 10) {
    response += `⚠️ **Room for improvement.** Try pushing from ${savingsRate}% to 20%. That extra ${20 - savingsRate}% = ₹${Math.round(stats.monthlyIncome * (0.20 - savingsRate/100))}/month.\n\n`;
  } else {
    response += `🔴 **Critical.** Your savings rate is very low. Here's a rescue plan:\n\n`;
  }

  response += `**Actionable Steps**:\n`;
  response += `1. **Apply the 50/30/20 rule**: Needs ₹${Math.round(stats.monthlyIncome * 0.5)} | Wants ₹${Math.round(stats.monthlyIncome * 0.3)} | Save ₹${Math.round(stats.monthlyIncome * 0.2)}\n`;
  response += `2. **Automate savings**: Set up a standing instruction on payday\n`;
  response += `3. **Track daily**: Small ₹100-200 daily savings compound to ₹3,000-6,000/month\n`;
  response += `4. **Cut subscriptions**: Audit monthly subscriptions — most people have 2-3 they don't use\n`;

  const categories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  if (categories.length > 0) {
    const [topCat, topAmt] = categories[0];
    const potential = Math.round((topAmt as number) * 0.15);
    response += `5. **Quick win**: Reducing **${topCat}** by 15% saves you ₹${potential}/month (₹${potential * 12}/year)\n`;
  }

  return response;
}

function generateExpenseResponse(stats: any): string {
  const categories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  let response = `## 📊 Expense Breakdown\n\n`;
  response += `**Total Monthly Expenses**: ₹${stats.monthlyExpense.toLocaleString('en-IN')}\n`;
  response += `**Trend**: ${stats.expenseTrend > 0 ? '📈 Up' : stats.expenseTrend < 0 ? '📉 Down' : '➡️ Flat'} ${Math.abs(stats.expenseTrend)}% from last month\n\n`;

  if (categories.length > 0) {
    response += `| Category | Amount | % of Total |\n|----------|--------|------------|\n`;
    for (const [cat, amt] of categories) {
      const pct = stats.monthlyExpense > 0 ? Math.round(((amt as number) / stats.monthlyExpense) * 100) : 0;
      const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(Math.max(0, 20 - Math.round(pct / 5)));
      response += `| ${cat} | ₹${Math.round(amt as number).toLocaleString('en-IN')} | ${pct}% |\n`;
    }
    response += `\n`;

    if (categories.length >= 2) {
      response += `**Key Insights**:\n`;
      response += `• Your top expense is **${categories[0][0]}** at ₹${Math.round(categories[0][1] as number).toLocaleString('en-IN')}\n`;
      const topTwo = categories.slice(0, 2).reduce((s, [, a]) => s + (a as number), 0);
      const topTwoPct = Math.round((topTwo / stats.monthlyExpense) * 100);
      response += `• Top 2 categories make up **${topTwoPct}%** of your total spending\n`;
    }
  } else {
    response += `No expenses recorded this month. Start tracking to get detailed insights!\n`;
  }

  return response;
}

function generateBudgetResponse(stats: any, budgets: any[]): string {
  let response = `## 📋 Budget Overview\n\n`;
  response += `**Monthly Income**: ₹${stats.monthlyIncome.toLocaleString('en-IN')}\n`;
  response += `**Monthly Expenses**: ₹${stats.monthlyExpense.toLocaleString('en-IN')}\n`;
  response += `**Net Cash Flow**: ₹${stats.netCashFlow.toLocaleString('en-IN')}\n\n`;

  if (budgets.length > 0) {
    response += `### Current Budget Status\n\n`;
    for (const budget of budgets) {
      const statusIcon = budget.status === 'exceeded' ? '🔴' : budget.status === 'warning' ? '🟡' : '🟢';
      const pct = budget.percentage || Math.round((budget.spentAmount / budget.limitAmount) * 100);
      response += `${statusIcon} **${budget.category}**: ₹${budget.spentAmount?.toLocaleString('en-IN') || 0} / ₹${budget.limitAmount?.toLocaleString('en-IN') || 0} (${pct}%)\n`;
    }

    const exceeded = budgets.filter(b => b.status === 'exceeded');
    if (exceeded.length > 0) {
      response += `\n⚠️ **${exceeded.length} budget(s) exceeded!** Focus on: ${exceeded.map(b => b.category).join(', ')}\n`;
    }
  } else {
    response += `You don't have any budgets set up yet. Here's a recommended allocation:\n\n`;
  }

  response += `\n### Recommended Budget (50/30/20 Rule)\n`;
  response += `• **Needs** (50%): ₹${Math.round(stats.monthlyIncome * 0.5).toLocaleString('en-IN')} — rent, utilities, groceries, transport\n`;
  response += `• **Wants** (30%): ₹${Math.round(stats.monthlyIncome * 0.3).toLocaleString('en-IN')} — entertainment, dining out, shopping\n`;
  response += `• **Savings & Investments** (20%): ₹${Math.round(stats.monthlyIncome * 0.2).toLocaleString('en-IN')} — emergency fund, SIPs, FDs\n`;

  return response;
}

function generateInvestResponse(stats: any): string {
  const investable = Math.max(0, stats.savings * 0.5);

  let response = `## 📈 Investment Strategy\n\n`;
  response += `**Available for Investment**: ~₹${Math.round(investable).toLocaleString('en-IN')}/month\n`;
  response += `(Based on 50% of your net savings of ₹${stats.savings.toLocaleString('en-IN')})\n\n`;

  if (investable <= 0) {
    response += `⚠️ You need positive savings before investing. Focus on:\n`;
    response += `1. Reducing expenses by 10-15%\n`;
    response += `2. Building a small emergency buffer of ₹${Math.round(stats.monthlyExpense).toLocaleString('en-IN')}\n`;
    response += `3. Then start with even ₹500/month SIP\n\n`;
  } else {
    response += `### Suggested Allocation\n\n`;
    response += `| Asset Class | Allocation | Monthly SIP |\n|-------------|-----------|-------------|\n`;
    response += `| Equity Index Funds | 40% | ₹${Math.round(investable * 0.4).toLocaleString('en-IN')} |\n`;
    response += `| Mid-cap Funds | 20% | ₹${Math.round(investable * 0.2).toLocaleString('en-IN')} |\n`;
    response += `| Debt/Bond Funds | 20% | ₹${Math.round(investable * 0.2).toLocaleString('en-IN')} |\n`;
    response += `| Gold ETF/SGBs | 10% | ₹${Math.round(investable * 0.1).toLocaleString('en-IN')} |\n`;
    response += `| Emergency Liquid Fund | 10% | ₹${Math.round(investable * 0.1).toLocaleString('en-IN')} |\n\n`;

    // Projection
    const monthly = investable;
    const rate = 0.12; // 12% annual
    const years5 = Math.round(monthly * ((Math.pow(1 + rate/12, 60) - 1) / (rate/12)));
    const years10 = Math.round(monthly * ((Math.pow(1 + rate/12, 120) - 1) / (rate/12)));

    response += `### 📊 Growth Projection (at 12% avg return)\n`;
    response += `• **5 years**: ₹${years5.toLocaleString('en-IN')} (invested: ₹${Math.round(monthly * 60).toLocaleString('en-IN')})\n`;
    response += `• **10 years**: ₹${years10.toLocaleString('en-IN')} (invested: ₹${Math.round(monthly * 120).toLocaleString('en-IN')})\n`;
  }

  response += `\n⚠️ *This is educational content, not financial advice. Past returns don't guarantee future performance. Consult a SEBI-registered advisor.*`;

  return response;
}

function generateHealthResponse(healthScore: any): string {
  let response = `## 🏥 Financial Health Report\n\n`;
  response += `**Score**: **${healthScore.score}/100** — Grade: **${healthScore.grade}**\n\n`;

  if (healthScore.score >= 80) {
    response += `🌟 **Excellent!** You're in great financial shape. Keep maintaining this discipline.\n\n`;
  } else if (healthScore.score >= 60) {
    response += `👍 **Good**, but there's room to improve. Focus on the weaker areas below.\n\n`;
  } else if (healthScore.score >= 40) {
    response += `⚠️ **Needs attention.** Several areas require improvement for financial stability.\n\n`;
  } else {
    response += `🔴 **Critical.** Your financial health needs immediate attention. Follow the suggestions below.\n\n`;
  }

  response += `### Detailed Breakdown\n\n`;
  response += `| Area | Score | Status |\n|------|-------|--------|\n`;
  for (const [key, val] of Object.entries(healthScore.breakdown) as [string, any][]) {
    const pct = Math.round((val.score / val.maxScore) * 100);
    const status = pct >= 70 ? '🟢' : pct >= 40 ? '🟡' : '🔴';
    response += `| ${key.replace(/([A-Z])/g, ' $1').trim()} | ${val.score}/${val.maxScore} | ${status} ${val.detail} |\n`;
  }

  if (healthScore.suggestions?.length > 0) {
    response += `\n### 💡 Action Items\n\n`;
    healthScore.suggestions.forEach((s: string, i: number) => {
      response += `${i + 1}. ${s}\n`;
    });
  }

  return response;
}

function generateForecastResponse(stats: any): string {
  let response = `## 🔮 Financial Forecast\n\n`;

  const projectedExpense = Math.round(stats.monthlyExpense * (1 + (stats.expenseTrend || 0) / 100));
  const projectedIncome = Math.round(stats.monthlyIncome * (1 + (stats.incomeTrend || 0) / 100));
  const projectedSavings = projectedIncome - projectedExpense;

  response += `Based on your current trends, here's a projection for next month:\n\n`;
  response += `| Metric | Current | Projected | Change |\n|--------|---------|-----------|--------|\n`;
  response += `| Income | ₹${stats.monthlyIncome.toLocaleString('en-IN')} | ₹${projectedIncome.toLocaleString('en-IN')} | ${stats.incomeTrend > 0 ? '+' : ''}${stats.incomeTrend || 0}% |\n`;
  response += `| Expenses | ₹${stats.monthlyExpense.toLocaleString('en-IN')} | ₹${projectedExpense.toLocaleString('en-IN')} | ${stats.expenseTrend > 0 ? '+' : ''}${stats.expenseTrend || 0}% |\n`;
  response += `| Savings | ₹${stats.savings.toLocaleString('en-IN')} | ₹${projectedSavings.toLocaleString('en-IN')} | ${projectedSavings > stats.savings ? '📈' : '📉'} |\n\n`;

  if (projectedSavings < 0) {
    response += `⚠️ **Warning**: At this rate, you may overspend next month by ₹${Math.abs(projectedSavings).toLocaleString('en-IN')}.\n`;
    response += `**Recommendation**: Cut discretionary spending by at least ₹${Math.abs(projectedSavings).toLocaleString('en-IN')} to break even.\n`;
  } else {
    response += `✅ You're projected to save ₹${projectedSavings.toLocaleString('en-IN')} next month.\n`;
  }

  // Annual projection
  const annualSavings = stats.savings * 12;
  response += `\n### Annual Outlook (if current month repeats)\n`;
  response += `• Annual Income: ₹${(stats.monthlyIncome * 12).toLocaleString('en-IN')}\n`;
  response += `• Annual Expenses: ₹${(stats.monthlyExpense * 12).toLocaleString('en-IN')}\n`;
  response += `• Annual Savings: ₹${annualSavings.toLocaleString('en-IN')}\n`;

  return response;
}

function generateCompareResponse(stats: any): string {
  let response = `## 📊 Income vs Expenses Comparison\n\n`;

  response += `| Metric | Amount |\n|--------|--------|\n`;
  response += `| 💰 Monthly Income | ₹${stats.monthlyIncome.toLocaleString('en-IN')} |\n`;
  response += `| 💸 Monthly Expenses | ₹${stats.monthlyExpense.toLocaleString('en-IN')} |\n`;
  response += `| 💵 Net Savings | ₹${stats.savings.toLocaleString('en-IN')} |\n`;
  response += `| 📈 Income Trend | ${stats.incomeTrend > 0 ? '+' : ''}${stats.incomeTrend || 0}% |\n`;
  response += `| 📉 Expense Trend | ${stats.expenseTrend > 0 ? '+' : ''}${stats.expenseTrend || 0}% |\n\n`;

  const ratio = stats.monthlyIncome > 0 ? (stats.monthlyExpense / stats.monthlyIncome * 100).toFixed(1) : 'N/A';
  response += `**Expense-to-Income Ratio**: ${ratio}%\n\n`;

  if (Number(ratio) > 90) {
    response += `🔴 **Danger zone**: You're spending over 90% of your income. This leaves almost no buffer for emergencies.\n`;
  } else if (Number(ratio) > 70) {
    response += `🟡 **Moderate**: You have some breathing room, but aim to bring expenses below 70% of income.\n`;
  } else {
    response += `🟢 **Healthy**: Your expense ratio is well-controlled. Great financial discipline!\n`;
  }

  return response;
}

function generateEmergencyFundResponse(stats: any): string {
  const monthsOfExpenses3 = stats.monthlyExpense * 3;
  const monthsOfExpenses6 = stats.monthlyExpense * 6;
  const monthsToSave = stats.savings > 0 ? Math.ceil(monthsOfExpenses3 / stats.savings) : 0;

  let response = `## 🛡️ Emergency Fund Planning\n\n`;
  response += `Based on your monthly expenses of ₹${stats.monthlyExpense.toLocaleString('en-IN')}:\n\n`;
  response += `| Target | Amount |\n|--------|--------|\n`;
  response += `| 3 Months (Minimum) | ₹${monthsOfExpenses3.toLocaleString('en-IN')} |\n`;
  response += `| 6 Months (Recommended) | ₹${monthsOfExpenses6.toLocaleString('en-IN')} |\n\n`;

  if (stats.savings > 0) {
    response += `At your current savings rate of ₹${stats.savings.toLocaleString('en-IN')}/month:\n`;
    response += `• 3-month fund takes **~${monthsToSave} months** to build\n`;
    response += `• 6-month fund takes **~${monthsToSave * 2} months** to build\n\n`;
  }

  response += `**Where to keep it**:\n`;
  response += `1. **Liquid Mutual Fund** — 5-7% returns, instant withdrawal\n`;
  response += `2. **High-yield Savings Account** — 4-7% interest, full liquidity\n`;
  response += `3. **Short-term FD** — 6-7% returns, break penalty is minimal\n\n`;
  response += `💡 **Tip**: Never invest your emergency fund in stocks or equity — it must be instantly accessible.`;

  return response;
}

function generateTipsResponse(stats: any): string {
  let response = `## 💡 Smart Money Tips\n\n`;

  const tips = [
    `**Zero-Based Budgeting**: Assign every rupee a job. Income minus expenses should equal zero (with savings being an "expense").`,
    `**24-Hour Rule**: For any non-essential purchase over ₹${Math.round(stats.monthlyIncome * 0.02 || 500)}, wait 24 hours before buying.`,
    `**Pay Yourself First**: Transfer ${Math.round(stats.monthlyIncome * 0.2 || 0)} to savings the moment your salary hits.`,
    `**Track Everything**: Even ₹20 chai expenses add up to ₹600/month or ₹7,200/year.`,
    `**Review Monthly**: Spend 30 minutes at month-end reviewing your FinAI dashboard.`,
    `**Negotiate Bills**: Call your service providers annually to negotiate better rates on internet, insurance, and subscriptions.`,
    `**Use Cash for Wants**: Studies show paying with cash reduces impulse spending by 20%.`,
    `**Meal Planning**: Planning meals reduces food spending by 15-25%.`,
  ];

  tips.forEach((tip, i) => {
    response += `${i + 1}. ${tip}\n`;
  });

  return response;
}

function generateSmartResponse(
  message: string,
  stats: any,
  healthScore: any,
  budgets: any[] = [],
  recentExpenses: any[] = []
): string {
  const topics = detectTopics(message);
  const responseParts: string[] = [];

  for (const topic of topics) {
    switch (topic) {
      case 'savings':
        responseParts.push(generateSavingsResponse(stats));
        break;
      case 'expenses':
        responseParts.push(generateExpenseResponse(stats));
        break;
      case 'budget':
        responseParts.push(generateBudgetResponse(stats, budgets));
        break;
      case 'invest':
        responseParts.push(generateInvestResponse(stats));
        break;
      case 'health':
        responseParts.push(generateHealthResponse(healthScore));
        break;
      case 'income':
        responseParts.push(generateCompareResponse(stats));
        break;
      case 'forecast':
        responseParts.push(generateForecastResponse(stats));
        break;
      case 'compare':
        responseParts.push(generateCompareResponse(stats));
        break;
      case 'emergency':
        responseParts.push(generateEmergencyFundResponse(stats));
        break;
      case 'tips':
        responseParts.push(generateTipsResponse(stats));
        break;
      case 'goals':
        responseParts.push(generateSavingsResponse(stats));
        break;
      case 'debt':
        responseParts.push(generateEmergencyFundResponse(stats));
        break;
      case 'overview':
      default: {
        let overview = `## 📊 Your Financial Snapshot\n\n`;
        overview += `| Metric | Value |\n|--------|-------|\n`;
        overview += `| 💰 Net Worth | ₹${stats.totalBalance.toLocaleString('en-IN')} |\n`;
        overview += `| 📈 Monthly Income | ₹${stats.monthlyIncome.toLocaleString('en-IN')} |\n`;
        overview += `| 📉 Monthly Expenses | ₹${stats.monthlyExpense.toLocaleString('en-IN')} |\n`;
        overview += `| 💵 Net Savings | ₹${stats.savings.toLocaleString('en-IN')} |\n`;
        overview += `| 🏥 Health Score | ${healthScore.score}/100 (${healthScore.grade}) |\n\n`;
        overview += `**What would you like to explore?**\n`;
        overview += `• "How can I **save** more?"\n`;
        overview += `• "Show my **expense** breakdown"\n`;
        overview += `• "How should I **budget**?"\n`;
        overview += `• "Where should I **invest**?"\n`;
        overview += `• "**Forecast** my finances"\n`;
        overview += `• "Plan my **emergency fund**"\n`;
        overview += `• "Give me **tips** to manage money"`;
        responseParts.push(overview);
        break;
      }
    }
  }

  let finalResponse = responseParts.join('\n\n---\n\n');

  // Add anomaly warnings if applicable
  const anomalies = detectAnomalies(recentExpenses);
  if (anomalies.length > 0) {
    finalResponse += '\n\n---\n\n### 🔍 Anomaly Alerts\n\n' + anomalies.join('\n');
  }

  // Add seasonal advice occasionally (only for overview/tips/savings)
  if (topics.includes('overview') || topics.includes('tips') || topics.includes('savings')) {
    finalResponse += getSeasonalAdvice();
  }

  return finalResponse;
}

export const aiRoutes = router;

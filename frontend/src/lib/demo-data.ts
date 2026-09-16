import { expenseAPI, incomeAPI, budgetAPI, goalAPI } from "./api";

export async function seedSampleStartupData() {
  const incomes = [
    { amount: 145000, source: "salary", description: "Founders Draw / Salary", date: new Date().toISOString().split("T")[0], isRecurring: true },
    { amount: 62000, source: "freelance", description: "AI Architecture Consulting", date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0], isRecurring: false },
    { amount: 38000, source: "side_hustle", description: "Micro-SaaS Subscriptions MRR", date: new Date(Date.now() - 12 * 86400000).toISOString().split("T")[0], isRecurring: true },
    { amount: 15000, source: "investment", description: "Mutual Fund & Dividend Yield", date: new Date(Date.now() - 18 * 86400000).toISOString().split("T")[0], isRecurring: false },
  ];

  const expenses = [
    { amount: 14200, category: "subscriptions", description: "AWS Cloud & GPU Compute Cluster", date: new Date().toISOString().split("T")[0], paymentMethod: "credit_card", notes: "Production API infrastructure" },
    { amount: 8450, category: "subscriptions", description: "OpenAI & Anthropic API Tokens", date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], paymentMethod: "credit_card", notes: "LLM inference burn" },
    { amount: 6500, category: "rent", description: "WeWork Dedicated Desk / Hub", date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0], paymentMethod: "net_banking", notes: "Co-working space monthly" },
    { amount: 3200, category: "food", description: "Team Sprint Lunch & Coffee", date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0], paymentMethod: "upi", notes: "Sprint retrospective meeting" },
    { amount: 4800, category: "shopping", description: "4K External Monitor Mount & USB Hub", date: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0], paymentMethod: "upi", notes: "Workstation gear" },
    { amount: 2100, category: "transportation", description: "Client Onsite Uber Rides", date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0], paymentMethod: "upi", notes: "Pitch meetings" },
    { amount: 12000, category: "investments", description: "SIP Index Fund Investment", date: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0], paymentMethod: "net_banking", notes: "Long term compounding" },
    { amount: 2400, category: "utilities", description: "High-Speed Fiber 1Gbps Internet", date: new Date(Date.now() - 19 * 86400000).toISOString().split("T")[0], paymentMethod: "upi", notes: "Office connectivity" },
  ];

  const budgets = [
    { category: "subscriptions", limitAmount: 30000, period: "monthly", alertEnabled: true, alertThreshold: 80 },
    { category: "rent", limitAmount: 10000, period: "monthly", alertEnabled: true, alertThreshold: 90 },
    { category: "food", limitAmount: 15000, period: "monthly", alertEnabled: true, alertThreshold: 75 },
    { category: "shopping", limitAmount: 12000, period: "monthly", alertEnabled: true, alertThreshold: 85 },
    { category: "investments", limitAmount: 25000, period: "monthly", alertEnabled: false, alertThreshold: 80 },
  ];

  const goals = [
    { name: "6-Month Runway Emergency Fund", targetAmount: 300000, currentAmount: 185000, targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0], icon: "🛡️", color: "#3B82F6", type: "savings" },
    { name: "New M3 Max Workstation", targetAmount: 220000, currentAmount: 140000, targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0], icon: "💻", color: "#8B5CF6", type: "purchase" },
    { name: "Seed Round Legal & Trademark Fund", targetAmount: 150000, currentAmount: 90000, targetDate: new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0], icon: "🚀", color: "#22C55E", type: "startup" },
  ];

  try {
    for (const inc of incomes) {
      await incomeAPI.create(inc).catch(() => {});
    }
    for (const exp of expenses) {
      await expenseAPI.create(exp).catch(() => {});
    }
    for (const b of budgets) {
      await budgetAPI.create(b).catch(() => {});
    }
    for (const g of goals) {
      await goalAPI.create(g).catch(() => {});
    }
    return { success: true };
  } catch (error) {
    console.error("Error seeding demo data:", error);
    return { success: false, error };
  }
}

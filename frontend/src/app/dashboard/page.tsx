"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { analyticsAPI, budgetAPI, goalAPI, expenseAPI, incomeAPI } from "../../lib/api";
import { useAuthStore } from "../../store/auth-store";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../lib/currency";
import {
  DashboardStats,
  HealthScore,
  Budget,
  Goal,
  Expense,
  ExpenseCategory,
  IncomeSource,
  PAYMENT_METHODS,
  CATEGORY_CONFIG,
  INCOME_SOURCE_CONFIG,
} from "../../lib/types";

// Modular Reusable Components
import { MetricCard } from "../../components/dashboard/MetricCard";
import { CashFlowChart } from "../../components/dashboard/CashFlowChart";
import { FinancialHealthCard } from "../../components/dashboard/FinancialHealthCard";
import { AIIntelligenceFeed } from "../../components/dashboard/AIIntelligenceFeed";
import { SpendingBreakdownCard } from "../../components/dashboard/SpendingBreakdownCard";
import { GoalsSummarySection } from "../../components/dashboard/GoalsSummarySection";
import { AttentionSection } from "../../components/dashboard/AttentionSection";
import { TransactionLedgerTable } from "../../components/dashboard/TransactionLedgerTable";
import DemoDataBanner from "../../components/dashboard/DemoDataBanner";
import FreshStartChecklist from "../../components/dashboard/FreshStartChecklist";
import { isDemoModeActive } from "../../lib/demo-store";

import {
  Plus,
  Receipt,
  TrendingUp,
  ClipboardList,
  Target,
  X,
  Sparkles,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Activity,
  BookOpen,
  Lightbulb,
  Plane,
  Home,
  Smartphone,
  Folder,
} from "lucide-react";
import Link from "next/link";

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  food: Utensils,
  transportation: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  healthcare: Activity,
  education: BookOpen,
  utilities: Lightbulb,
  travel: Plane,
  rent: Home,
  investments: TrendingUp,
  subscriptions: Smartphone,
  others: Folder,
};

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [trendMonths, setTrendMonths] = useState<number>(6);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  // Quick Action Modals
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("subscriptions");
  const [expDesc, setExpDesc] = useState("");
  const [expPayment, setExpPayment] = useState("credit_card");

  const [incAmount, setIncAmount] = useState("");
  const [incSource, setIncSource] = useState<IncomeSource>("salary");
  const [incDesc, setIncDesc] = useState("");

  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");

  // Currency & global event listeners
  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);

    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    const handleOpenExp = () => setExpenseModalOpen(true);
    const handleOpenInc = () => setIncomeModalOpen(true);

    window.addEventListener("finai:currency-change", handleCurChange);
    window.addEventListener("finai:open-add-expense", handleOpenExp);
    window.addEventListener("finai:open-add-income", handleOpenInc);

    return () => {
      window.removeEventListener("finai:currency-change", handleCurChange);
      window.removeEventListener("finai:open-add-expense", handleOpenExp);
      window.removeEventListener("finai:open-add-income", handleOpenInc);
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, healthRes, budgetsRes, goalsRes, trendsRes] =
        await Promise.all([
          analyticsAPI.dashboard(),
          analyticsAPI.healthScore(),
          budgetAPI.list(),
          goalAPI.list(),
          analyticsAPI.trends(trendMonths),
        ]);

      setStats(statsRes.data);
      setHealthScore(healthRes.data);
      setBudgets(budgetsRes.data || []);
      setGoals(goalsRes.data || []);
      setTrends(trendsRes.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [trendMonths]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return;
    try {
      setSubmitting(true);
      await expenseAPI.create({
        amount: Number(expAmount),
        category: expCategory,
        description: expDesc || `${expCategory} expense`,
        paymentMethod: expPayment,
        date: new Date().toISOString(),
      });
      setExpAmount("");
      setExpDesc("");
      setExpenseModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Income
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incAmount || Number(incAmount) <= 0) return;
    try {
      setSubmitting(true);
      await incomeAPI.create({
        amount: Number(incAmount),
        source: incSource,
        description: incDesc || `${incSource} inflow`,
        date: new Date().toISOString(),
      });
      setIncAmount("");
      setIncDesc("");
      setIncomeModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add income:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget || Number(goalTarget) <= 0) return;
    try {
      setSubmitting(true);
      await goalAPI.create({
        name: goalName,
        targetAmount: Number(goalTarget),
        currentAmount: Number(goalCurrent || 0),
        targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
        icon: "🎯",
        color: "#8B5CF6",
      });
      setGoalName("");
      setGoalTarget("");
      setGoalCurrent("0");
      setGoalModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add goal:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Financial KPI calculations
  const netWorth = useMemo(() => {
    if (!stats) return 694050;
    const goalsSum = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
    const balance = stats.totalBalance || 0;
    return balance + goalsSum > 0 ? balance + goalsSum : 694050;
  }, [stats, goals]);

  const monthlyIncome = useMemo(() => {
    if (stats?.monthlyIncome && stats.monthlyIncome > 0) return stats.monthlyIncome;
    return 810000;
  }, [stats]);

  const monthlySpending = useMemo(() => {
    if (stats?.monthlyExpense && stats.monthlyExpense > 0) return stats.monthlyExpense;
    return 117750;
  }, [stats]);

  const savingsAmount = useMemo(() => {
    return Math.max(0, monthlyIncome - monthlySpending);
  }, [monthlyIncome, monthlySpending]);

  const savingsRatePct = useMemo(() => {
    if (monthlyIncome <= 0) return 85;
    return Math.round((savingsAmount / monthlyIncome) * 100);
  }, [monthlyIncome, savingsAmount]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.02] border border-white/[0.06] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-white/[0.02] border border-white/[0.06] rounded-2xl" />
          <div className="lg:col-span-4 h-80 bg-white/[0.02] border border-white/[0.06] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* Demo Data Management Banner */}
      <DemoDataBanner />

      {/* Fresh Start Checklist (If in fresh start mode with 0 transactions) */}
      {!isDemoModeActive() && (!stats?.monthlyExpense || stats.monthlyExpense === 0) && (
        <FreshStartChecklist />
      )}

      {/* ===================== HERO SECTION ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>{getGreetingTime()}, {user?.name?.split(" ")[0] || "Demo"}</span>
            <span>•</span>
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Financial Overview
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Your financial position improved by{" "}
            <strong className="text-emerald-400 font-semibold">+12.4%</strong> this month.
          </p>
        </div>

        {/* Compact Action Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIncomeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121828] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.06] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Income</span>
          </button>

          <Link
            href="/dashboard/budgets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121828] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.06] transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
            <span>Set Budget</span>
          </Link>

          <button
            onClick={() => setGoalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121828] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.06] transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* ===================== ROW 1: 4 KPI CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: NET WORTH */}
        <MetricCard
          title="Net Worth"
          value={formatCurrency(netWorth, currency)}
          trendText="+8.4% this month"
          isPositiveTrend={true}
          contextText="Liquid + Goal Reserves"
          sparklineData={[580000, 600000, 625000, 640000, 660000, 675000, netWorth]}
        />

        {/* Card 2: MONTHLY INCOME */}
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome, currency)}
          trendText="+5.2% vs last month"
          isPositiveTrend={true}
          contextText="Recurring + Consulting Revenue"
          sparklineData={[720000, 750000, 740000, 780000, 790000, 805000, monthlyIncome]}
        />

        {/* Card 3: MONTHLY SPENDING */}
        <MetricCard
          title="Monthly Spending"
          value={formatCurrency(monthlySpending, currency)}
          trendText="-4.8% vs last month"
          isPositiveTrend={true} // Lower spending is good
          contextText="Below budget by ₹22,250"
          sparklineData={[140000, 132000, 128000, 125000, 122000, 119000, monthlySpending]}
        />

        {/* Card 4: SAVINGS RATE */}
        <MetricCard
          title="Savings Rate"
          value={`${savingsRatePct}%`}
          trendText="+6.2% vs last month"
          isPositiveTrend={true}
          contextText={`${formatCurrency(savingsAmount, currency)} saved`}
          type="progress"
          progressPercent={savingsRatePct}
        />
      </div>

      {/* ===================== ROW 2: CASH FLOW & FINANCIAL HEALTH ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <CashFlowChart
            data={trends}
            currency={currency}
            monthRange={trendMonths}
            onRangeChange={setTrendMonths}
          />
        </div>
        <div className="lg:col-span-4">
          <FinancialHealthCard healthScore={healthScore} />
        </div>
      </div>

      {/* ===================== ROW 3: AI INTELLIGENCE & SPENDING BREAKDOWN ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AIIntelligenceFeed currency={currency} />
        </div>
        <div className="lg:col-span-5">
          <SpendingBreakdownCard
            categoryBreakdown={stats?.categoryBreakdown || {}}
            totalSpending={monthlySpending}
            currency={currency}
          />
        </div>
      </div>

      {/* ===================== ROW 4: FINANCIAL GOALS ===================== */}
      <GoalsSummarySection
        goals={goals}
        currency={currency}
        onOpenNewGoal={() => setGoalModalOpen(true)}
      />

      {/* ===================== ROW 5: ATTENTION & RECENT TRANSACTIONS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AttentionSection currency={currency} />
        </div>
        <div className="lg:col-span-7">
          <TransactionLedgerTable
            transactions={stats?.recentTransactions || []}
            currency={currency}
          />
        </div>
      </div>

      {/* ===================== MODALS ===================== */}
      {/* Quick Add Expense Modal */}
      {expenseModalOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fin-fade"
          onClick={() => setExpenseModalOpen(false)}
        >
          <div
            className="fin-card bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Log Outflow / Expense</h3>
              </div>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="0.00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 font-mono text-sm font-bold outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-200 text-xs font-medium outline-none"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.icon} {conf.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Merchant / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS Infrastructure, Figma Team"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={expPayment}
                  onChange={(e) => setExpPayment(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-200 text-xs outline-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>
                      {pm.icon} {pm.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? "Logging..." : "Log Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Income Modal */}
      {incomeModalOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fin-fade"
          onClick={() => setIncomeModalOpen(false)}
        >
          <div
            className="fin-card bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Add Inflow / Revenue</h3>
              </div>
              <button
                onClick={() => setIncomeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="0.00"
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 font-mono text-sm font-bold outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source Channel
                </label>
                <select
                  value={incSource}
                  onChange={(e) => setIncSource(e.target.value as IncomeSource)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-200 text-xs font-medium outline-none"
                >
                  {Object.entries(INCOME_SOURCE_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.icon} {conf.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Client
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Client Retainer"
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-200 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIncomeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Inflow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {goalModalOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fin-fade"
          onClick={() => setGoalModalOpen(false)}
        >
          <div
            className="fin-card bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Create Financial Goal</h3>
              </div>
              <button
                onClick={() => setGoalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Series A Runway Buffer"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 text-xs outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 font-mono text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Reserve ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

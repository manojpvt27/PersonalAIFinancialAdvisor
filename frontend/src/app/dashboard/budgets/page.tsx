"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { budgetAPI, expenseAPI } from "../../../lib/api";
import { Budget, CATEGORY_CONFIG, ExpenseCategory } from "../../../lib/types";
import {
  Plus,
  X,
  Search,
  Filter,
  RotateCcw,
  MoreVertical,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  Activity,
  Lightbulb,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Category config with emojis and curated brand colors
const CATEGORY_UI_PRESETS: Record<
  string,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  food: {
    label: "Food & Dining",
    icon: "🍔",
    color: "#22C55E",
    bg: "rgba(197, 132, 34, 0.1)",
    border: "rgba(34, 197, 94, 0.2)",
  },
  shopping: {
    label: "Shopping",
    icon: "🛒",
    color: "#EC4899",
    bg: "rgba(236, 72, 153, 0.1)",
    border: "rgba(236, 72, 153, 0.2)",
  },
  transportation: {
    label: "Transportation",
    icon: "🚗",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.2)",
  },
  housing: {
    label: "Housing & Rent",
    icon: "🏠",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.1)",
    border: "rgba(139, 92, 246, 0.2)",
  },
  entertainment: {
    label: "Entertainment",
    icon: "🎬",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.2)",
  },
  travel: {
    label: "Travel & Leisure",
    icon: "✈️",
    color: "#06B6D4",
    bg: "rgba(6, 182, 212, 0.1)",
    border: "rgba(6, 182, 212, 0.2)",
  },
  utilities: {
    label: "Utilities & Bills",
    icon: "⚡",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.2)",
  },
  healthcare: {
    label: "Healthcare",
    icon: "🏥",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  overall: {
    label: "Overall Budget",
    icon: "📊",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.1)",
    border: "rgba(124, 58, 237, 0.2)",
  },
};

// Activity Log Item Type
interface ActivityLog {
  id: string;
  type: "create" | "update" | "exceed" | "delete";
  title: string;
  time: string;
  icon: string;
  color: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("remaining_asc");

  // Form State
  const [formData, setFormData] = useState({
    category: "food",
    limitAmount: "",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
    alertThreshold: "80",
  });

  // Recent activity stream state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      type: "update",
      title: "Updated Food & Dining Limit to ₹12,000",
      time: "2 hours ago",
      icon: "🍔",
      color: "#22C55E",
    },
    {
      id: "2",
      type: "exceed",
      title: "Critical Alert: Shopping budget reached 98%",
      time: "5 hours ago",
      icon: "🛒",
      color: "#EF4444",
    },
    {
      id: "3",
      type: "create",
      title: "Created Transportation Limit (₹6,000/mo)",
      time: "1 day ago",
      icon: "🚗",
      color: "#3B82F6",
    },
    {
      id: "4",
      type: "delete",
      title: "Archived Q4 Travel & Leisure Threshold",
      time: "3 days ago",
      icon: "✈️",
      color: "#6B7280",
    },
  ]);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await budgetAPI.list();
      setBudgets(data);
    } catch (error) {
      console.error("Failed to load budgets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const handleOpenModal = (budgetToEdit?: Budget) => {
    if (budgetToEdit) {
      setEditingBudget(budgetToEdit);
      setFormData({
        category: budgetToEdit.category,
        limitAmount: budgetToEdit.limitAmount.toString(),
        startDate: budgetToEdit.startDate ? new Date(budgetToEdit.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        endDate: budgetToEdit.endDate ? new Date(budgetToEdit.endDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        alertThreshold: budgetToEdit.alertThreshold.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category: "food",
        limitAmount: "8000",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        )
          .toISOString()
          .split("T")[0],
        alertThreshold: "80",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await budgetAPI.update(editingBudget.id, {
          limitAmount: Number(formData.limitAmount),
          alertThreshold: Number(formData.alertThreshold),
        });
        setActivityLogs((prev) => [
          {
            id: Date.now().toString(),
            type: "update",
            title: `Updated ${CATEGORY_UI_PRESETS[formData.category]?.label || formData.category
              } limit`,
            time: "Just now",
            icon: CATEGORY_UI_PRESETS[formData.category]?.icon || "📊",
            color: "#7C3AED",
          },
          ...prev,
        ]);
      } else {
        await budgetAPI.create({
          category: formData.category,
          limitAmount: Number(formData.limitAmount),
          startDate: formData.startDate,
          endDate: formData.endDate,
          alertThreshold: Number(formData.alertThreshold),
        });
        setActivityLogs((prev) => [
          {
            id: Date.now().toString(),
            type: "create",
            title: `Created ${CATEGORY_UI_PRESETS[formData.category]?.label || formData.category
              } budget (${fmt(Number(formData.limitAmount))})`,
            time: "Just now",
            icon: CATEGORY_UI_PRESETS[formData.category]?.icon || "📊",
            color: "#22C55E",
          },
          ...prev,
        ]);
      }
      setShowModal(false);
      loadBudgets();
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  };

  const handleDelete = async (id: string, category: string) => {
    if (!confirm("Are you sure you want to delete this budget limit?")) return;
    try {
      await budgetAPI.delete(id);
      setActivityLogs((prev) => [
        {
          id: Date.now().toString(),
          type: "delete",
          title: `Deleted ${CATEGORY_UI_PRESETS[category]?.label || category
            } budget`,
          time: "Just now",
          icon: CATEGORY_UI_PRESETS[category]?.icon || "🗑️",
          color: "#EF4444",
        },
        ...prev,
      ]);
      loadBudgets();
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const createPresetBudget = async (category: string, limitAmount: number) => {
    try {
      const startDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];
      const endDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];
      await budgetAPI.create({
        category,
        limitAmount,
        startDate,
        endDate,
        alertThreshold: 80,
      });
      loadBudgets();
    } catch (error) {
      console.error(error);
    }
  };

  // -------------------------------------------------------------
  // Filter & Sort Logic
  // -------------------------------------------------------------
  const filteredBudgets = useMemo(() => {
    return budgets
      .filter((b) => {
        // Search filter
        const catLabel = (
          CATEGORY_UI_PRESETS[b.category]?.label || b.category
        ).toLowerCase();
        const matchesSearch =
          catLabel.includes(searchQuery.toLowerCase()) ||
          b.category.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory =
          selectedCategory === "all" || b.category === selectedCategory;

        // Status filter
        let matchesStatus = true;
        if (selectedStatus === "on_track") {
          matchesStatus = b.percentage <= 70;
        } else if (selectedStatus === "warning") {
          matchesStatus = b.percentage > 70 && b.percentage <= 90;
        } else if (selectedStatus === "critical") {
          matchesStatus = b.percentage > 90;
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "limit_desc") return b.limitAmount - a.limitAmount;
        if (sortBy === "spent_desc") return b.spentAmount - a.spentAmount;
        if (sortBy === "remaining_asc") return a.remaining - b.remaining;
        if (sortBy === "name_asc")
          return (
            CATEGORY_UI_PRESETS[a.category]?.label || a.category
          ).localeCompare(CATEGORY_UI_PRESETS[b.category]?.label || b.category);
        return 0;
      });
  }, [budgets, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalBudget = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overspentCount = budgets.filter((b) => b.percentage >= 90).length;
    const overallSpentPct =
      totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overspentCount,
      overallSpentPct,
    };
  }, [budgets]);

  // Chart dataset generation
  const chartData = useMemo(() => {
    const categoryBarData = budgets.map((b) => ({
      name: (CATEGORY_UI_PRESETS[b.category]?.label || b.category).split(" ")[0],
      Limit: b.limitAmount,
      Spent: b.spentAmount,
    }));

    const donutData = budgets.map((b) => ({
      name: CATEGORY_UI_PRESETS[b.category]?.label || b.category,
      value: b.spentAmount,
      color: CATEGORY_UI_PRESETS[b.category]?.color || "#7C3AED",
    }));

    const trendData = [
      { month: "Jan", Spent: Math.round(stats.totalSpent * 0.7), Limit: stats.totalBudget },
      { month: "Feb", Spent: Math.round(stats.totalSpent * 0.8), Limit: stats.totalBudget },
      { month: "Mar", Spent: Math.round(stats.totalSpent * 0.75), Limit: stats.totalBudget },
      { month: "Apr", Spent: Math.round(stats.totalSpent * 0.9), Limit: stats.totalBudget },
      { month: "May", Spent: Math.round(stats.totalSpent * 0.85), Limit: stats.totalBudget },
      { month: "Current", Spent: stats.totalSpent, Limit: stats.totalBudget },
    ];

    return { categoryBarData, donutData, trendData };
  }, [budgets, stats]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMonth("current");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("remaining_asc");
  };

  return (
    <div className="space-y-8 pb-12 font-[family-name:var(--font-inter)] text-[#111827]">
      {/* ===================== TOP HEADER & BREADCRUMB ===================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#7C3AED] font-semibold">Budgets</span>
          </div>

          {/* Large Title (32px Bold) */}
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
            Budgets & Limits
          </h1>
          {/* Subtitle */}
          <p className="text-sm text-[#6B7280] mt-1">
            Create spending limits for categories and monitor monthly expenses with AI assistance.
          </p>
        </div>

        {/* Top Right Controls & Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold py-2.5 px-5 rounded-[12px] shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Budget</span>
          </button>
        </div>
      </div>

      {/* ===================== 4 SUMMARY STATISTICS CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Budget */}
        <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_0_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Budget
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] text-[#7C3AED] flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-outfit)]">
              {fmt(stats.totalBudget)}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#22C55E] font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{budgets.length} Category Limits</span>
            </div>
          </div>
        </div>

        {/* Card 2: Spent This Month */}
        <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_0_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Spent This Month
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-outfit)]">
                {fmt(stats.totalSpent)}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {stats.overallSpentPct}%
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.overallSpentPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Remaining Budget */}
        <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_0_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Remaining Budget
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-outfit)]">
              {fmt(Math.max(0, stats.totalRemaining))}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#6B7280] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>
                {100 - stats.overallSpentPct}% available safe capacity
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Overspent Categories */}
        <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_0_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Overspent / Critical
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${stats.overspentCount > 0
                ? "bg-rose-50 text-[#EF4444]"
                : "bg-emerald-50 text-[#22C55E]"
                }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2
              className={`text-2xl font-extrabold font-[family-name:var(--font-outfit)] ${stats.overspentCount > 0 ? "text-[#EF4444]" : "text-[#111827]"
                }`}
            >
              {stats.overspentCount}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium">
              <span
                className={
                  stats.overspentCount > 0
                    ? "text-[#EF4444]"
                    : "text-[#22C55E]"
                }
              >
                {stats.overspentCount > 0
                  ? "Requires spending adjustment"
                  : "All budget categories healthy"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== FILTER BAR ===================== */}
      <div className="card p-4 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {/* Search Budget */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search budget category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
            />
          </div>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-semibold text-[#111827] px-3 py-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 cursor-pointer"
          >
            <option value="current">July 2026 (Current)</option>
            <option value="last">June 2026 (Last Month)</option>
            <option value="q1">Q1 2026 Summary</option>
            <option value="all">All Time</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold text-[#111827] px-3 py-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_UI_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.icon} {item.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold text-[#111827] px-3 py-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="on_track">🟢 On Track (0-70%)</option>
            <option value="warning">🟠 Warning (70-90%)</option>
            <option value="critical">🔴 Critical (&gt;90%)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold text-[#111827] px-3 py-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 cursor-pointer"
          >
            <option value="remaining_asc">Sort: Lowest Remaining</option>
            <option value="limit_desc">Sort: Highest Budget</option>
            <option value="spent_desc">Sort: Highest Spent</option>
            <option value="name_asc">Sort: Category A-Z</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="p-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===================== BUDGET CARDS SECTION (4 COLS DESKTOP) ===================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            Active Category Budgets ({filteredBudgets.length})
          </h2>
          <span className="text-xs font-medium text-[#6B7280]">
            Desktop: 4 columns • Auto-updates live
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="card h-[220px] bg-slate-100 animate-pulse rounded-[16px]"
                />
              ))}
          </div>
        ) : filteredBudgets.length === 0 ? (
          /* EMPTY STATE ILLUSTRATION CONTAINER */
          <div className="card p-12 bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm text-center flex flex-col items-center justify-center my-6">
            <div className="w-20 h-20 rounded-full bg-[#F3F0FF] text-[#7C3AED] flex items-center justify-center text-3xl mb-4 shadow-inner">
              🎯
            </div>
            <h3 className="text-xl font-bold text-[#111827]">
              No budgets created yet
            </h3>
            <p className="text-sm text-[#6B7280] max-w-md mt-1 mb-6 leading-relaxed">
              Create your first monthly budget to start tracking spending and receive AI-powered financial insights.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="btn btn-primary bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-2.5 px-5 rounded-[12px] shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create First Budget</span>
              </button>

              <button
                onClick={() => createPresetBudget("food", 8000)}
                className="btn btn-secondary border border-[#E5E7EB] bg-white text-xs font-semibold py-2.5 px-4 rounded-[12px] text-[#111827] hover:bg-slate-50"
              >
                🍔 Add Food Preset (₹8,000)
              </button>
            </div>
          </div>
        ) : (
          /* RESPONSIVE GRID: 4 COLS DESKTOP, 2 TABLET, 1 MOBILE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredBudgets.map((budget) => {
              const preset =
                CATEGORY_UI_PRESETS[budget.category] || CATEGORY_UI_PRESETS["overall"];
              const pct = budget.percentage;

              // Color logic: 0-70% Green (#22C55E), 70-90% Orange (#F59E0B), 90-100%+ Red (#EF4444)
              const statusColor =
                pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#22C55E";
              const statusBg =
                pct >= 90
                  ? "rgba(239, 68, 68, 0.1)"
                  : pct >= 70
                    ? "rgba(245, 158, 11, 0.1)"
                    : "rgba(34, 197, 94, 0.1)";
              const statusLabel =
                pct >= 90 ? "Critical" : pct >= 70 ? "Warning" : "On Track";

              return (
                <div
                  key={budget.id}
                  className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_0_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top Row: Icon, Category Name & 3-Dot Options */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ background: preset.bg }}
                        >
                          {preset.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#111827] truncate">
                            {preset.label}
                          </h4>
                          <span className="text-[11px] text-[#6B7280] font-mono block">
                            Budget: {fmt(budget.limitAmount)}
                          </span>
                        </div>
                      </div>

                      {/* 3-Dot Options Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === budget.id ? null : budget.id
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-[#6B7280] transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === budget.id && (
                          <div
                            className="absolute right-0 top-8 w-36 bg-white border border-[#E5E7EB] rounded-[12px] shadow-lg py-1.5 z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleOpenModal(budget);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#111827] hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                              <span>Edit Limit</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleDelete(budget.id, budget.category);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#EF4444] hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount Numbers */}
                    <div className="my-3">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-[#6B7280] font-medium">Spent</span>
                        <span className="font-extrabold text-[#111827] font-[family-name:var(--font-outfit)] text-base">
                          {fmt(budget.spentAmount)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs mt-1">
                        <span className="text-[#6B7280] font-medium">Remaining</span>
                        <span
                          className="font-bold font-mono text-xs"
                          style={{
                            color: budget.remaining < 0 ? "#EF4444" : "#22C55E",
                          }}
                        >
                          {budget.remaining >= 0
                            ? fmt(budget.remaining)
                            : `-${fmt(Math.abs(budget.remaining))}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Animated Progress Bar & Status Badge */}
                  <div className="mt-2 pt-3 border-t border-[#E5E7EB]/60">
                    <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          background: statusColor,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold font-mono text-[#6B7280]">
                        {pct}%
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: statusBg, color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== AI BUDGET INSIGHTS SECTION ===================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7C3AED]" />
          <h2 className="text-xl font-semibold text-[#111827]">
            AI Budget Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Insight 1 */}
          <div className="card p-4 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              ✔
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">
                Food spending is healthy
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                Currently 35% below monthly limit. On track to save ₹2,800.
              </p>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="card p-4 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#EF4444] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              ⚠
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">
                Shopping budget almost exhausted
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                98% spent with 8 days remaining. Consider pausing purchases.
              </p>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="card p-4 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              📈
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">
                Transportation decreased 12%
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                Commute spending dropped compared to last month&apos;s baseline.
              </p>
            </div>
          </div>

          {/* Insight 4 */}
          <div className="card p-4 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              💡
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">
                Suggested monthly savings: ₹14,500
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                Reallocating unspent utilities budget toward your emergency target.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== CHARTS SECTION ===================== */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#111827]">
          Analytics & Trends
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Monthly Spending Trend (Line / Area) */}
          <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Monthly Spending Trend
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Overall expenditure vs monthly budget cap
                </p>
              </div>
              <span className="badge text-[10px] py-1 px-2.5 font-semibold bg-[#F3F0FF] text-[#7C3AED]">
                6 Month View
              </span>
            </div>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.trendData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderRadius: "10px",
                      color: "#FFF",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Spent"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSpent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Breakdown (Donut Pie Chart) */}
          <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs">
            <h3 className="text-sm font-bold text-[#111827] mb-1">
              Category Breakdown
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">Distribution of total spent</p>

            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.donutData.length > 0 ? chartData.donutData : [{ name: 'None', value: 1, color: '#E5E7EB' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-[#6B7280] font-medium">Total Spent</span>
                <span className="text-base font-extrabold text-[#111827]">
                  {fmt(stats.totalSpent)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Budget vs Actual Bar Chart */}
        <div className="card p-5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs">
          <h3 className="text-sm font-bold text-[#111827] mb-1">
            Budget vs Actual Spent Per Category
          </h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Comparison of allocated limits against real expenditure
          </p>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Limit" fill="#E5E7EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Spent" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===================== RECENT ACTIVITY STREAM ===================== */}
      <div className="card p-6 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#111827]">
            Recent Budget Activity
          </h3>
          <span className="text-xs font-semibold text-[#7C3AED] cursor-pointer hover:underline">
            View Log History
          </span>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: `${log.color}15` }}
                >
                  {log.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111827]">
                    {log.title}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {log.time}
                  </p>
                </div>
              </div>
              <span className="badge text-[10px] py-1 px-2.5 rounded-full bg-slate-100 text-[#6B7280] font-mono">
                Action Logged
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== CREATE / EDIT BUDGET MODAL ===================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] text-[#7C3AED] flex items-center justify-center font-bold">
                  ⚡
                </div>
                <h3 className="text-base font-bold text-[#111827]">
                  {editingBudget ? "Edit Budget Limit" : "Create Budget Limit"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#6B7280]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Category
                </label>
                <select
                  className="w-full text-sm font-semibold p-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={!!editingBudget}
                >
                  {Object.entries(CATEGORY_UI_PRESETS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.icon} {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Monthly Budget Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B7280]">
                    ₹
                  </span>
                  <input
                    type="number"
                    className="w-full text-base font-extrabold pl-8 pr-4 py-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                    placeholder="0"
                    required
                    value={formData.limitAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, limitAmount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full text-xs font-medium p-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full text-xs font-medium p-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Alert Warning Threshold ({formData.alertThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  className="w-full accent-[#7C3AED]"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, alertThreshold: e.target.value })
                  }
                />
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Triggers overspending alert when category reaches {formData.alertThreshold}% of budget limit.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn flex-1 text-xs font-semibold py-2.5 rounded-[12px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn flex-1 text-xs font-bold py-2.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm"
                >
                  {editingBudget ? "Save Changes" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

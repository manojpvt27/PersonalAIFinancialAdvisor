"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { goalAPI } from "../../../lib/api";
import { Goal } from "../../../lib/types";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import {
  Shield,
  Plane,
  ShoppingBag,
  TrendingUp,
  Target,
  Plus,
  X,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Clock,
  Zap,
} from "lucide-react";

const GOAL_TYPES = [
  { value: "emergency_fund", label: "Runway & Emergency Fund", icon: "🛡️", color: "#3B82F6" },
  { value: "purchase", label: "Gear & Infrastructure Upgrade", icon: "💻", color: "#8B5CF6" },
  { value: "investment", label: "Seed Capital & Investment", icon: "📈", color: "#22C55E" },
  { value: "vacation", label: "Offsite & Team Retreat", icon: "✈️", color: "#06B6D4" },
  { value: "custom", label: "Custom Strategic Target", icon: "🎯", color: "#F59E0B" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeNote, setContributeNote] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "emergency_fund",
    targetAmount: "",
    currentAmount: "0",
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
    icon: "🎯",
    color: "#3B82F6",
  });

  // Currency listener
  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);

    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await goalAPI.list();
      setGoals(data || []);
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || Number(formData.targetAmount) <= 0) return;
    try {
      setSubmitting(true);
      await goalAPI.create({
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
      });
      setShowModal(false);
      setFormData({
        name: "",
        type: "emergency_fund",
        targetAmount: "",
        currentAmount: "0",
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
        icon: "🎯",
        color: "#3B82F6",
      });
      await loadGoals();
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContribute || !contributeAmount || Number(contributeAmount) <= 0) return;
    try {
      setSubmitting(true);
      await goalAPI.contribute(showContribute, Number(contributeAmount), contributeNote);
      setShowContribute(null);
      setContributeAmount("");
      setContributeNote("");
      await loadGoals();
    } catch (error) {
      console.error("Failed to contribute to goal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this strategic goal?")) return;
    try {
      await goalAPI.delete(id);
      await loadGoals();
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  // Aggregated stats
  const stats = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
    const totalCurrent = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
    const overallPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
    return { totalTarget, totalCurrent, overallPct };
  }, [goals]);

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-900 dark:text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO BANNER ===================== */}
      <div className="p-6 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capital Accumulation & Target Milestones</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)] tracking-tight">
              Strategic Goals & Reserves
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Accumulated{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.totalCurrent, currency)}
              </strong>{" "}
              towards your total milestone target of{" "}
              <strong className="text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.totalTarget, currency)}
              </strong>{" "}
              ({stats.overallPct}% funded).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Strategic Target
            </button>
          </div>
        </div>
      </div>

      {/* ===================== TOP 3 METRICS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Target Capital
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)]">
              {formatCurrency(stats.totalTarget, currency)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across {goals.length} tracked goals
            </p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reserves Funded
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)]">
              {formatCurrency(stats.totalCurrent, currency)}
            </h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {stats.overallPct}% total progress achieved
            </p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Deficit
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)]">
              {formatCurrency(Math.max(0, stats.totalTarget - stats.totalCurrent), currency)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Remaining to reach full milestone target
            </p>
          </div>
        </div>
      </div>

      {/* ===================== GOALS GRID ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          );
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

          return (
            <div
              key={g.id}
              className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs"
                      style={{ background: `${g.color || "#3B82F6"}15` }}
                    >
                      <span>{g.icon || "🎯"}</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {g.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Target: {new Date(g.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between mt-4 mb-1">
                  <span className="text-lg font-extrabold font-[family-name:var(--font-outfit)] text-slate-900 dark:text-white">
                    {formatCurrency(g.currentAmount, currency)}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    / {formatCurrency(g.targetAmount, currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden my-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: g.color || "#8B5CF6",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium mt-2">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{daysLeft} days remaining</span>
                  </span>
                  <span
                    className="font-bold font-mono px-2 py-0.5 rounded-md text-[10px]"
                    style={{
                      background: `${g.color || "#8B5CF6"}15`,
                      color: g.color || "#8B5CF6",
                    }}
                  >
                    {pct}% Funded
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {pct >= 100 ? "🎉 Milestone Achieved!" : "Active Milestone"}
                </span>
                <button
                  onClick={() => setShowContribute(g.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Top Up Goal
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              No strategic targets configured
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Define runway targets, equipment reserves, or tax buffers.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Strategic Target
            </button>
          </div>
        )}
      </div>

      {/* ===================== CREATE GOAL MODAL ===================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-100 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Set New Strategic Target
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Define runway reserve or capital goal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 6-Month Runway Reserve"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs font-semibold text-slate-900 dark:text-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Category
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const sel = GOAL_TYPES.find((t) => t.value === e.target.value);
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      icon: sel?.icon || "🎯",
                      color: sel?.color || "#3B82F6",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs font-semibold text-slate-900 dark:text-white focus:border-purple-500"
                >
                  {GOAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Capital ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Reserve ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.currentAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, currentAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs font-mono text-slate-900 dark:text-white focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Horizon Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Set Strategic Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TOP UP CONTRIBUTION MODAL ===================== */}
      {showContribute && (
        <div
          className="fixed inset-0 z-100 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowContribute(null)}
        >
          <div
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Top Up Goal Reserve</span>
              </h2>
              <button
                onClick={() => setShowContribute(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contribution Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="0.00"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-sm font-mono font-bold text-slate-900 dark:text-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly surplus transfer"
                  value={contributeNote}
                  onChange={(e) => setContributeNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowContribute(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Allocating..." : "Confirm Top Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

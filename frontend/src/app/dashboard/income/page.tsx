"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { incomeAPI } from "../../../lib/api";
import { Income, INCOME_SOURCE_CONFIG, IncomeSource } from "../../../lib/types";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building,
  Laptop,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ source: "", search: "", page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    source: "salary" as IncomeSource,
    type: "recurring",
    date: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: true,
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

  const loadIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: filters.page, limit: 15 };
      if (filters.source) params.source = filters.source;
      if (filters.search) params.search = filters.search;
      const { data } = await incomeAPI.list(params);
      setIncomes(data.incomes || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error("Failed to load income records:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const handleOpenCreate = () => {
    setEditingIncome(null);
    setFormData({
      amount: "",
      source: "salary",
      type: "recurring",
      date: new Date().toISOString().split("T")[0],
      description: "",
      isRecurring: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (inc: Income) => {
    setEditingIncome(inc);
    setFormData({
      amount: String(inc.amount),
      source: inc.source || "salary",
      type: inc.type || "recurring",
      date: new Date(inc.date).toISOString().split("T")[0],
      description: inc.description || "",
      isRecurring: inc.isRecurring ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;
    try {
      setSubmitting(true);
      if (editingIncome) {
        await incomeAPI.update(editingIncome.id, {
          ...formData,
          amount: Number(formData.amount),
        });
      } else {
        await incomeAPI.create({
          ...formData,
          amount: Number(formData.amount),
        });
      }
      setShowModal(false);
      await loadIncomes();
    } catch (error) {
      console.error("Failed to save income:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this revenue entry?")) return;
    try {
      await incomeAPI.delete(id);
      await loadIncomes();
    } catch (error) {
      console.error("Failed to delete income:", error);
    }
  };

  // Metrics
  const totalInflow = useMemo(() => {
    return incomes.reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);
  }, [incomes]);

  const recurringInflow = useMemo(() => {
    return incomes
      .filter((i) => i.isRecurring)
      .reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);
  }, [incomes]);

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-900 dark:text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO BANNER ===================== */}
      <div className="p-6 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capital Inflow & Revenue Streams</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)] tracking-tight">
              Income & Revenue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Track founder salary, tech consulting retainers, micro-SaaS MRR, and investment yields in one unified dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Record Revenue Stream
            </button>
          </div>
        </div>
      </div>

      {/* ===================== TOP 3 METRICS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Inflows
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)]">
              {formatCurrency(totalInflow, currency)}
            </h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Across {pagination.total} revenue events</span>
            </p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recurring MRR / Retainers
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)]">
              {formatCurrency(recurringInflow, currency)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Predictable baseline monthly cashflow
            </p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Source
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)] capitalize">
              {filters.source ? filters.source : "All Inflow Streams"}
            </h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
              {filters.source ? "Filtered stream view" : "Full consolidated telemetry"}
            </p>
          </div>
        </div>
      </div>

      {/* ===================== FILTER CONTROLS ===================== */}
      <div className="p-4 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description or client..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Source Dropdown */}
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value, page: 1 })}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="">All Inflow Sources</option>
            {Object.entries(INCOME_SOURCE_CONFIG).map(([key, conf]) => (
              <option key={key} value={key}>
                {conf.icon} {conf.label}
              </option>
            ))}
          </select>
        </div>

        {(filters.source || filters.search) && (
          <button
            onClick={() => setFilters({ source: "", search: "", page: 1 })}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* ===================== INCOME TABLE ===================== */}
      <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="pb-3 pl-2">Revenue Stream / Client</th>
                <th className="pb-3">Source Channel</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {incomes.map((inc) => {
                const conf = INCOME_SOURCE_CONFIG[inc.source] || {
                  label: inc.source,
                  icon: "💰",
                };
                return (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                          <span>{conf.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {inc.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          inc.isRecurring
                            ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {inc.isRecurring ? "Recurring MRR" : "One-off"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(inc.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(inc.amount, currency)}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No income records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== ADD / EDIT INCOME MODAL ===================== */}
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
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingIncome ? "Edit Revenue Entry" : "Record Inflow Stream"}
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Log new capital or recurring retainer
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
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-sm font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revenue Channel
                </label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value as IncomeSource })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500"
                >
                  {Object.entries(INCOME_SOURCE_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.icon} {conf.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Client Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Strategy Retainer, Founder Salary"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs text-slate-900 dark:text-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recurrence
                  </label>
                  <select
                    value={formData.isRecurring ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({ ...formData, isRecurring: e.target.value === "yes" })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="yes">Recurring Stream</option>
                    <option value="no">One-off Inflow</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingIncome ? "Update Inflow" : "Add Revenue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

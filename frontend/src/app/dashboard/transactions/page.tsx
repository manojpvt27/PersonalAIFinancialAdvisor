"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import { Expense, ExpenseCategory, AIClassification, CATEGORY_CONFIG } from "../../../lib/types";
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { CATEGORY_ICON_MAP } from "../page";

export default function TransactionsIntelligencePage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");

  const [transactions, setTransactions] = useState<Expense[]>([
    {
      id: "tx-1",
      userId: "demo",
      amount: 48900,
      category: "shopping",
      date: new Date().toISOString(),
      paymentMethod: "credit_card",
      description: "Apple Store 5K Studio Display",
      notes: "Hardware upgrade for workstation",
      isRecurring: false,
      aiClassification: "investment",
      isAnomaly: true,
      accountName: "Corporate Platinum Card",
    },
    {
      id: "tx-2",
      userId: "demo",
      amount: 14200,
      category: "subscriptions",
      date: new Date(Date.now() - 86400000).toISOString(),
      paymentMethod: "credit_card",
      description: "AWS Cloud Infrastructure Cluster",
      notes: "Monthly production compute burn",
      isRecurring: true,
      aiClassification: "need",
      isAnomaly: false,
      accountName: "Primary Operating Account",
    },
    {
      id: "tx-3",
      userId: "demo",
      amount: 8450,
      category: "subscriptions",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      paymentMethod: "credit_card",
      description: "OpenAI & Anthropic API Tokens",
      notes: "LLM inference tier",
      isRecurring: true,
      aiClassification: "business",
      isAnomaly: false,
      accountName: "Primary Operating Account",
    },
    {
      id: "tx-4",
      userId: "demo",
      amount: 6500,
      category: "rent",
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      paymentMethod: "net_banking",
      description: "WeWork Dedicated Desk Hub",
      notes: "Co-working space monthly",
      isRecurring: true,
      aiClassification: "need",
      isAnomaly: false,
      accountName: "Primary Operating Account",
    },
    {
      id: "tx-5",
      userId: "demo",
      amount: 3200,
      category: "food",
      date: new Date(Date.now() - 6 * 86400000).toISOString(),
      paymentMethod: "upi",
      description: "Team Sprint Retrospective Lunch",
      notes: "Founder meal expense",
      isRecurring: false,
      aiClassification: "want",
      isAnomaly: false,
      accountName: "Physical Cash Float",
    },
    {
      id: "tx-6",
      userId: "demo",
      amount: 12000,
      category: "investments",
      date: new Date(Date.now() - 8 * 86400000).toISOString(),
      paymentMethod: "net_banking",
      description: "SIP Index Fund Allocation",
      notes: "Long term compounding reserve",
      isRecurring: true,
      aiClassification: "investment",
      isAnomaly: false,
      accountName: "Tech Growth Portfolio",
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const anomaly = useMemo(() => {
    return transactions.find((t) => t.isAnomaly);
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterClass !== "all" && t.aiClassification !== filterClass) return false;
      if (filterAccount !== "all" && t.accountName !== filterAccount) return false;
      return true;
    });
  }, [transactions, search, filterCategory, filterClass, filterAccount]);

  const handleExportCSV = () => {
    const headers = "Date,Merchant,Category,Classification,Account,Amount\n";
    const rows = filtered
      .map(
        (t) =>
          `"${new Date(t.date).toISOString().split("T")[0]}","${t.description.replace(/"/g, '""')}","${t.category}","${t.aiClassification || "need"}","${t.accountName || "Bank"}","${t.amount}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finai_transactions_intelligence.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Machine Learning Ledger</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Transaction Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time multi-account audit stream with automated Need/Want/Investment classification and anomaly detection.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#121828] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.06] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* ===================== ANOMALY ALERT BANNER ===================== */}
      {anomaly && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Spending Anomaly Detected
                </span>
                <span className="text-xs font-mono font-bold text-slate-100 tabular-nums">
                  {formatCurrency(anomaly.amount, currency)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {anomaly.description} is <strong>6.4× larger</strong> than your 30-day baseline in this category.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setTransactions(transactions.map((t) => (t.id === anomaly.id ? { ...t, isAnomaly: false } : t)));
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
            >
              Acknowledge & Confirm
            </button>
          </div>
        </div>
      )}

      {/* ===================== MULTI-DIMENSIONAL FILTERS ===================== */}
      <div className="fin-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search merchant, tags, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#121828] border border-white/[0.06] text-slate-200 placeholder:text-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#121828] border border-white/[0.06] text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
              <option key={key} value={key}>
                {conf.icon} {conf.label}
              </option>
            ))}
          </select>

          {/* AI Classification Filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#121828] border border-white/[0.06] text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Classifications</option>
            <option value="need">Need (Essential)</option>
            <option value="want">Want (Discretionary)</option>
            <option value="investment">Investment (Capital)</option>
            <option value="business">Business / R&D</option>
          </select>
        </div>

        {(filterCategory !== "all" || filterClass !== "all" || search) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterCategory("all");
              setFilterClass("all");
            }}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ===================== TRANSACTIONS TABLE ===================== */}
      <div className="fin-card p-5 lg:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase font-semibold text-slate-400">
                <th className="pb-3 pl-2">Merchant & Notes</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">AI Classification</th>
                <th className="pb-3">Account</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((tx) => {
                const IconComponent = CATEGORY_ICON_MAP[tx.category] || Layers;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#121828] border border-white/[0.06] flex items-center justify-center text-slate-300 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100 truncate max-w-[180px]">
                              {tx.description}
                            </span>
                            {tx.isAnomaly && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                                6.4x Surge
                              </span>
                            )}
                          </div>
                          {tx.notes && (
                            <p className="text-[10px] text-slate-400 truncate max-w-sm">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-medium text-slate-400 capitalize">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          tx.aiClassification === "need"
                            ? "bg-blue-500/10 text-blue-400"
                            : tx.aiClassification === "investment"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : tx.aiClassification === "business"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {tx.aiClassification || "Need"}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">
                      {tx.accountName || "Primary Account"}
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-rose-400 tabular-nums pr-2">
                      -{formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

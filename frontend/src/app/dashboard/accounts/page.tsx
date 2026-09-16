"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import { Account } from "../../../lib/types";
import {
  Building2,
  CreditCard,
  Wallet,
  PieChart,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  X,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";

export default function AccountsPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "acc-1",
      name: "Primary Operating Account",
      institution: "HDFC Bank",
      accountType: "bank",
      balance: 425000,
      isLiability: false,
      lastSynced: "10 mins ago",
      accountNumberMasked: "•••• 4821",
      status: "active",
    },
    {
      id: "acc-2",
      name: "High-Yield Reserves Vault",
      institution: "ICICI Direct",
      accountType: "bank",
      balance: 280000,
      isLiability: false,
      lastSynced: "Just now",
      accountNumberMasked: "•••• 9104",
      status: "active",
    },
    {
      id: "acc-3",
      name: "Tech Growth Portfolio",
      institution: "Zerodha / Coin",
      accountType: "investment",
      balance: 310000,
      isLiability: false,
      lastSynced: "1 hour ago",
      accountNumberMasked: "•••• 1928",
      status: "active",
    },
    {
      id: "acc-4",
      name: "Physical Cash Float",
      institution: "Office Safe",
      accountType: "cash",
      balance: 35000,
      isLiability: false,
      lastSynced: "Today",
      accountNumberMasked: "CASH-01",
      status: "active",
    },
    {
      id: "acc-5",
      name: "Corporate Platinum Card",
      institution: "American Express",
      accountType: "credit_card",
      balance: 42850,
      isLiability: true,
      lastSynced: "30 mins ago",
      accountNumberMasked: "•••• 7701",
      status: "active",
    },
    {
      id: "acc-6",
      name: "Equipment Working Capital",
      institution: "HDFC Commercial",
      accountType: "loan",
      balance: 145000,
      isLiability: true,
      lastSynced: "Today",
      accountNumberMasked: "•••• 3390",
      status: "active",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    accountType: "bank" as Account["accountType"],
    balance: "",
    accountNumberMasked: "•••• " + Math.floor(1000 + Math.random() * 9000),
  });

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const totalAssets = useMemo(() => {
    return accounts
      .filter((a) => !a.isLiability)
      .reduce((acc, a) => acc + (a.balance || 0), 0);
  }, [accounts]);

  const totalLiabilities = useMemo(() => {
    return accounts
      .filter((a) => a.isLiability)
      .reduce((acc, a) => acc + (a.balance || 0), 0);
  }, [accounts]);

  const netWorth = totalAssets - totalLiabilities;

  const filteredAccounts = useMemo(() => {
    if (filterType === "all") return accounts;
    if (filterType === "assets") return accounts.filter((a) => !a.isLiability);
    if (filterType === "liabilities") return accounts.filter((a) => a.isLiability);
    return accounts.filter((a) => a.accountType === filterType);
  }, [accounts, filterType]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.balance) return;

    const isLiab = formData.accountType === "credit_card" || formData.accountType === "loan";
    const newAcc: Account = {
      id: "acc-" + Date.now(),
      name: formData.name,
      institution: formData.institution || "Financial Institution",
      accountType: formData.accountType,
      balance: Number(formData.balance),
      isLiability: isLiab,
      lastSynced: "Just now",
      accountNumberMasked: formData.accountNumberMasked,
      status: "active",
    };

    setAccounts([...accounts, newAcc]);
    setShowModal(false);
    setFormData({
      name: "",
      institution: "",
      accountType: "bank",
      balance: "",
      accountNumberMasked: "•••• " + Math.floor(1000 + Math.random() * 9000),
    });
  };

  const handleDelete = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consolidated Financial Position</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Accounts Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live multi-institution ledger balancing liquid cash, investments, credit lines, and liabilities.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* ===================== 3 SUMMARY CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Worth */}
        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Consolidated Net Worth
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(netWorth, currency)}
          </h2>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Assets minus liabilities</span>
          </div>
        </div>

        {/* Total Assets */}
        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Assets (Liquid + Holdings)
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-emerald-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(totalAssets, currency)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Across {accounts.filter((a) => !a.isLiability).length} asset accounts
          </p>
        </div>

        {/* Total Liabilities */}
        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Liabilities & Credit
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-rose-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(totalLiabilities, currency)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Across {accounts.filter((a) => a.isLiability).length} credit & loan lines
          </p>
        </div>
      </div>

      {/* ===================== FILTER TABS ===================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All Accounts" },
          { key: "assets", label: "Assets Only" },
          { key: "liabilities", label: "Liabilities Only" },
          { key: "bank", label: "Bank Accounts" },
          { key: "investment", label: "Investments" },
          { key: "credit_card", label: "Credit Cards" },
          { key: "cash", label: "Cash Float" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              filterType === tab.key
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "bg-[#0E1422] text-slate-400 hover:text-slate-200 border border-white/[0.06]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== ACCOUNTS GRID ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isLiab = acc.isLiability;
          return (
            <div
              key={acc.id}
              className="fin-card p-5 flex flex-col justify-between hover:border-white/10 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isLiab ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {acc.accountType === "credit_card" ? (
                        <CreditCard className="w-4 h-4" />
                      ) : acc.accountType === "investment" ? (
                        <PieChart className="w-4 h-4" />
                      ) : acc.accountType === "cash" ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 truncate max-w-[140px]">
                        {acc.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate">
                        {acc.institution} • {acc.accountNumberMasked}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Archive Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {isLiab ? "Outstanding Balance" : "Available Balance"}
                  </span>
                  <h4
                    className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                      isLiab ? "text-rose-400" : "text-slate-100"
                    }`}
                  >
                    {isLiab ? "-" : ""}
                    {formatCurrency(acc.balance, currency)}
                  </h4>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Synced {acc.lastSynced}</span>
                </span>
                <span className="capitalize text-slate-400">{acc.accountType.replace("_", " ")}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== ADD ACCOUNT MODAL ===================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fin-fade"
          onClick={() => setShowModal(false)}
        >
          <div
            className="fin-card bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Connect Institution / Account</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Founders Checking, Startup Card"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC, Mercury, Silicon Valley Bank"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountType: e.target.value as Account["accountType"],
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-200 text-xs outline-none"
                >
                  <option value="bank">Bank Checking / Savings (Asset)</option>
                  <option value="investment">Investment Portfolio (Asset)</option>
                  <option value="cash">Physical Cash Float (Asset)</option>
                  <option value="credit_card">Credit Card Line (Liability)</option>
                  <option value="loan">Term Loan / Working Capital (Liability)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Balance ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121828] border border-white/[0.08] text-slate-100 font-mono text-sm font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

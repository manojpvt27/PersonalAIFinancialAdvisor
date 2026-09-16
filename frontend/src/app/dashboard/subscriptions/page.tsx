"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import { SubscriptionItem } from "../../../lib/types";
import {
  Layers,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      id: "sub-1",
      name: "AWS GPU & Cloud Hosting",
      category: "Infrastructure",
      amount: 14200,
      billingCycle: "monthly",
      renewalDate: "Tomorrow",
      usageStatus: "frequent",
      potentialSavings: 0,
      icon: "⚡",
    },
    {
      id: "sub-2",
      name: "OpenAI API Inference Tier",
      category: "AI & Tooling",
      amount: 8450,
      billingCycle: "monthly",
      renewalDate: "In 4 days",
      usageStatus: "frequent",
      potentialSavings: 0,
      icon: "🤖",
    },
    {
      id: "sub-3",
      name: "Figma Organization License",
      category: "Product & Design",
      amount: 3200,
      billingCycle: "monthly",
      renewalDate: "Sep 22",
      usageStatus: "moderate",
      potentialSavings: 0,
      icon: "🎨",
    },
    {
      id: "sub-4",
      name: "Zoom Workplace Enterprise",
      category: "Communications",
      amount: 1850,
      billingCycle: "monthly",
      renewalDate: "Sep 26",
      usageStatus: "unused",
      potentialSavings: 1850,
      icon: "📹",
    },
    {
      id: "sub-5",
      name: "Notion Team Workspace",
      category: "Productivity",
      amount: 1200,
      billingCycle: "monthly",
      renewalDate: "Sep 28",
      usageStatus: "price_increased",
      potentialSavings: 400,
      icon: "📝",
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

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, s) => acc + s.amount, 0);
  }, [subscriptions]);

  const totalAnnual = totalMonthly * 12;

  const totalPotentialSavings = useMemo(() => {
    return subscriptions.reduce((acc, s) => acc + s.potentialSavings, 0) * 12;
  }, [subscriptions]);

  const removeSub = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Recurring SaaS & Infrastructure Audit</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Subscription Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Autonomous detection of recurring vendor subscriptions, unused seats, and price increase telemetry.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
            Annualized Optimization
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
            Save {formatCurrency(totalPotentialSavings, currency)}/yr
          </span>
        </div>
      </div>

      {/* ===================== 3 METRIC CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Monthly Subscription Burn
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(totalMonthly, currency)}/mo
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Across {subscriptions.length} active recurring vendors
          </p>
        </div>

        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Annual Recurring Outflow
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-rose-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(totalAnnual, currency)}/yr
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Projected 12-month fixed software cost
          </p>
        </div>

        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Identified Leak Savings
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-emerald-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(totalPotentialSavings, currency)}/yr
          </h2>
          <p className="text-xs text-emerald-400 font-semibold mt-2">
            By trimming low-use & duplicate tools
          </p>
        </div>
      </div>

      {/* ===================== SUBSCRIPTIONS TABLE ===================== */}
      <div className="fin-card p-5 lg:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase font-semibold text-slate-400">
                <th className="pb-3 pl-2">Service / Vendor</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Renewal Date</th>
                <th className="pb-3">AI Usage Telemetry</th>
                <th className="pb-3 text-right">Cost</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sub.icon}</span>
                      <span className="font-semibold text-slate-100">{sub.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-400">{sub.category}</td>
                  <td className="py-3.5 text-slate-400">{sub.renewalDate}</td>
                  <td className="py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        sub.usageStatus === "unused"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : sub.usageStatus === "price_increased"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {sub.usageStatus === "unused"
                        ? "Zero Usage Detected"
                        : sub.usageStatus === "price_increased"
                        ? "Price Increase"
                        : "High Utilization"}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-slate-100 tabular-nums">
                    {formatCurrency(sub.amount, currency)}/mo
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => removeSub(sub.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-[11px] font-semibold transition-colors"
                    >
                      {sub.usageStatus === "unused" ? "Cancel Seat" : "Review"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import {
  FileText,
  Sparkles,
  ShieldAlert,
  Percent,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function TaxPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  const grossIncome = 810000 * 12; // 9,720,000 annual
  const eligibleDeductions = 150000 + 75000 + 48000; // 80C + 80D + Standard
  const taxableIncome = grossIncome - eligibleDeductions;
  const estimatedTaxLiability = Math.round(taxableIncome * 0.28);

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const deductionItems = [
    { section: "Section 80C", name: "ELSS, PPF, Term Insurance", max: 150000, utilized: 150000, status: "maxed" },
    { section: "Section 80D", name: "Health Insurance & Checkups", max: 75000, utilized: 50000, status: "partial" },
    { section: "Business Expense", name: "Workstation, SaaS & Cloud Compute", max: 120000, utilized: 98000, status: "partial" },
  ];

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Tax Planning & Deduction Telemetry (FY 2026-27)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Tax Intelligence Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Continuous calculation of estimated tax liability, deduction optimization, and business expense write-offs.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
            Estimated Tax Liability
          </span>
          <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(estimatedTaxLiability, currency)}
          </span>
        </div>
      </div>

      {/* ===================== DISCLAIMER BANNER ===================== */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Advisory Notice:</strong> Tax calculations are estimates based on your recorded cashflows and active regime. Consult a certified tax professional for official tax filings.
        </span>
      </div>

      {/* ===================== 3 SUMMARY METRICS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Estimated Annual Gross
          </span>
          <h2 className="text-2xl font-bold text-slate-100 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(grossIncome, currency)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Founders draw + consulting retainers</p>
        </div>

        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Claimed Deductions
          </span>
          <h2 className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(eligibleDeductions, currency)}
          </h2>
          <p className="text-xs text-emerald-400 font-semibold mt-1">Across 80C, 80D & business write-offs</p>
        </div>

        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Net Taxable Baseline
          </span>
          <h2 className="text-2xl font-bold text-purple-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(taxableIncome, currency)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Effective tax rate approx. 24.8%</p>
        </div>
      </div>

      {/* ===================== DEDUCTIONS AUDIT ===================== */}
      <div className="fin-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-100">
          Deductions & Exemption Optimization
        </h2>

        <div className="space-y-3">
          {deductionItems.map((item) => (
            <div
              key={item.section}
              className="p-4 rounded-xl bg-[#121828] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 font-mono">{item.section}</span>
                  <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Max allowable: {formatCurrency(item.max, currency)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-slate-100 tabular-nums">
                  {formatCurrency(item.utilized, currency)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    item.status === "maxed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {item.status === "maxed" ? "Maxed Out" : "Headroom Remaining"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

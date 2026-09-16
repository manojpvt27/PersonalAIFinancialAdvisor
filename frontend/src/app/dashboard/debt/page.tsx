"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import { DebtItem } from "../../../lib/types";
import {
  Percent,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function DebtCenterPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [extraPrepayment, setExtraPrepayment] = useState<number>(10000);
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");

  const debts: DebtItem[] = [
    {
      id: "debt-1",
      name: "Commercial Working Capital Loan",
      institution: "HDFC Commercial",
      debtType: "personal_loan",
      principalBalance: 145000,
      interestRate: 11.5,
      monthlyEMI: 14500,
      remainingTenureMonths: 11,
    },
    {
      id: "debt-2",
      name: "Corporate Platinum Card Balance",
      institution: "American Express",
      debtType: "credit_card",
      principalBalance: 42850,
      interestRate: 36.0,
      monthlyEMI: 8500,
      remainingTenureMonths: 5,
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const totalDebt = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.principalBalance, 0);
  }, [debts]);

  const totalEMI = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.monthlyEMI, 0);
  }, [debts]);

  // Projected interest savings
  const interestSaved = Math.round((extraPrepayment * 0.18) * 12);

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
            <Percent className="w-3.5 h-3.5" />
            <span>Liability Management & Accelerated Payoff</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Credit & Debt Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Audit principal balances, interest rate exposure, and compare Snowball vs. Avalanche accelerated payoff strategies.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
            Total Outstanding Principal
          </span>
          <span className="text-xl font-bold text-rose-400 font-mono tabular-nums">
            {formatCurrency(totalDebt, currency)}
          </span>
        </div>
      </div>

      {/* ===================== AI OPTIMIZATION NOTICE ===================== */}
      <div className="p-4 rounded-2xl bg-[#121828] border border-purple-500/20 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100">
            AI Avalanche Strategy Recommendation
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Allocating an additional <strong>{formatCurrency(extraPrepayment, currency)}/month</strong> towards your 36.0% Credit Card line will eliminate interest costs by approximately <strong>{formatCurrency(interestSaved, currency)}</strong> and clear liabilities 4 months ahead of schedule.
          </p>
        </div>
      </div>

      {/* ===================== DEBT LIABILITIES LIST ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debts.map((d) => (
          <div key={d.id} className="fin-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {d.institution} • {d.interestRate}% APR
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
                  {d.remainingTenureMonths} Mo Remaining
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{d.name}</h3>

              <div className="flex items-baseline justify-between mt-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Principal</span>
                  <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                    {formatCurrency(d.principalBalance, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly EMI</span>
                  <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                    {formatCurrency(d.monthlyEMI, currency)}/mo
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Amortized schedule active</span>
              <button className="text-xs font-semibold text-purple-400 hover:underline">
                View Schedule →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

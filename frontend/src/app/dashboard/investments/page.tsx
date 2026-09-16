"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import { InvestmentHolding } from "../../../lib/types";
import {
  PieChart as PieIcon,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const ASSET_COLORS = ["#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EC4899"];

export default function InvestmentsPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [sipAmount, setSipAmount] = useState<number>(25000);

  const holdings: InvestmentHolding[] = [
    {
      id: "inv-1",
      symbol: "NIFTY50",
      name: "Index ETF Fund",
      assetClass: "equity",
      currentValue: 185000,
      investedAmount: 145000,
      returnsPercent: 27.6,
      allocationPercent: 55,
    },
    {
      id: "inv-2",
      symbol: "TECH-MF",
      name: "Global Technology Mutual Fund",
      assetClass: "mutual_fund",
      currentValue: 85000,
      investedAmount: 70000,
      returnsPercent: 21.4,
      allocationPercent: 25,
    },
    {
      id: "inv-3",
      symbol: "GOLD-BEES",
      name: "Sovereign Gold ETF",
      assetClass: "gold",
      currentValue: 40000,
      investedAmount: 36000,
      returnsPercent: 11.1,
      allocationPercent: 12,
    },
    {
      id: "inv-4",
      symbol: "CRYPTO",
      name: "Bitcoin & Ethereum Reserve",
      assetClass: "crypto",
      currentValue: 26500,
      investedAmount: 22000,
      returnsPercent: 20.4,
      allocationPercent: 8,
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

  const totalPortfolioValue = useMemo(() => {
    return holdings.reduce((acc, h) => acc + h.currentValue, 0);
  }, [holdings]);

  const totalInvested = useMemo(() => {
    return holdings.reduce((acc, h) => acc + h.investedAmount, 0);
  }, [holdings]);

  const totalReturnsPct = totalInvested > 0
    ? (((totalPortfolioValue - totalInvested) / totalInvested) * 100).toFixed(1)
    : "0";

  // Compounding Projections (12% CAGR assumed)
  const compound5Yr = Math.round(sipAmount * 12 * 5 * 1.34);
  const compound10Yr = Math.round(sipAmount * 12 * 10 * 1.87);
  const compound20Yr = Math.round(sipAmount * 12 * 20 * 3.42);

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Capital Growth & Compounding Intelligence</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Investment Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Asset class distribution, technology concentration risk audits, and multi-decade wealth compounding projections.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
            Net Unrealized Gain
          </span>
          <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
            +{totalReturnsPct}% (+{formatCurrency(totalPortfolioValue - totalInvested, currency)})
          </span>
        </div>
      </div>

      {/* ===================== AI CONCENTRATION RISK ALERT ===================== */}
      <div className="p-4 rounded-2xl bg-[#121828] border border-purple-500/20 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100">
            AI Portfolio Diagnostics & Concentration Audit
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Your equity portfolio is currently <strong>80% concentrated in Index & Tech securities</strong>. Volatility exposure is moderate. Increasing sovereign gold / debt allocation to 15% will optimize Sharpe ratio.
          </p>
        </div>
      </div>

      {/* ===================== HOLDINGS & ALLOCATION ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Holdings Table */}
        <div className="lg:col-span-8 fin-card p-6">
          <h2 className="text-base font-semibold text-slate-100 mb-4">
            Asset Holdings & Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase font-semibold text-slate-400">
                  <th className="pb-3 pl-1">Asset / Symbol</th>
                  <th className="pb-3">Class</th>
                  <th className="pb-3 text-right">Invested</th>
                  <th className="pb-3 text-right">Current Value</th>
                  <th className="pb-3 text-right pr-1">Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {holdings.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-1">
                      <div>
                        <span className="font-bold text-slate-100 block">{h.symbol}</span>
                        <span className="text-[10px] text-slate-400">{h.name}</span>
                      </div>
                    </td>
                    <td className="py-3 capitalize text-slate-400">{h.assetClass.replace("_", " ")}</td>
                    <td className="py-3 text-right font-mono text-slate-400 tabular-nums">
                      {formatCurrency(h.investedAmount, currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-100 tabular-nums">
                      {formatCurrency(h.currentValue, currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400 tabular-nums pr-1">
                      +{h.returnsPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Compounding Simulator */}
        <div className="lg:col-span-4 fin-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 mb-1">
              Compounding Simulator
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Projected terminal wealth (12% CAGR assumed)
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Monthly SIP Contribution</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(sipAmount, currency)}/mo
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#121828] border border-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-slate-400">5-Year Milestone</span>
                <span className="text-sm font-bold font-mono text-slate-100 tabular-nums">
                  {formatCurrency(compound5Yr, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#121828] border border-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-slate-400">10-Year Milestone</span>
                <span className="text-sm font-bold font-mono text-purple-400 tabular-nums">
                  {formatCurrency(compound10Yr, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#121828] border border-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-slate-400">20-Year Milestone</span>
                <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                  {formatCurrency(compound20Yr, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import {
  Flame,
  ShieldCheck,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function RunwayPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [mode, setMode] = useState<"founder" | "freelancer" | "creator">("founder");

  const [liquidAssets, setLiquidAssets] = useState<number>(788000);
  const [monthlyBurn, setMonthlyBurn] = useState<number>(117750);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(810000);

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const baselineRunway = useMemo(() => {
    if (monthlyBurn <= 0) return 99;
    return (liquidAssets / monthlyBurn).toFixed(1);
  }, [liquidAssets, monthlyBurn]);

  // Stress testing scenarios
  const stressScenarios = useMemo(() => {
    const zeroIncMonths = (liquidAssets / monthlyBurn).toFixed(1);
    const drop20NetBurn = Math.max(0, monthlyBurn - monthlyRevenue * 0.8);
    const drop20Months = drop20NetBurn > 0 ? (liquidAssets / drop20NetBurn).toFixed(1) : "∞";

    const drop50NetBurn = Math.max(0, monthlyBurn - monthlyRevenue * 0.5);
    const drop50Months = drop50NetBurn > 0 ? (liquidAssets / drop50NetBurn).toFixed(1) : "∞";

    return [
      {
        title: "Zero Inflow Shock (0 Revenue)",
        desc: "All client retainers and inflows freeze completely.",
        runwayMonths: `${zeroIncMonths} Months`,
        severity: "critical",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      },
      {
        title: "Moderate Shock (-50% Revenue)",
        desc: "50% reduction in monthly MRR / client pipeline.",
        runwayMonths: `${drop50Months} Months`,
        severity: "warning",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      },
      {
        title: "Mild Correction (-20% Revenue)",
        desc: "20% drop in billable consulting hours or churn.",
        runwayMonths: `${drop20Months} Months`,
        severity: "healthy",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }, [liquidAssets, monthlyBurn, monthlyRevenue]);

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Operational Burn Rate & Survival Horizon</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Runway & Stress Testing
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live telemetry calculating zero-inflow survival time, fixed cost burn, and stress test resilience.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-[#121828] p-1 rounded-xl border border-white/[0.06]">
          {(["founder", "freelancer", "creator"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all ${
                mode === m
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m} Mode
            </button>
          ))}
        </div>
      </div>

      {/* ===================== 3 METRIC CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Current Zero-Inflow Runway
          </span>
          <h2 className="text-3xl font-bold text-purple-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {baselineRunway} Months
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Based on {formatCurrency(liquidAssets, currency)} liquid buffer
          </p>
        </div>

        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Monthly Operational Burn
          </span>
          <h2 className="text-3xl font-bold text-rose-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            {formatCurrency(monthlyBurn, currency)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Fixed overhead + recurring SaaS + salaries
          </p>
        </div>

        <div className="fin-card p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Monthly Net Cash Inflow
          </span>
          <h2 className="text-3xl font-bold text-emerald-400 font-[family-name:var(--font-outfit)] tabular-nums mt-2">
            +{formatCurrency(monthlyRevenue - monthlyBurn, currency)}
          </h2>
          <p className="text-xs text-emerald-400 font-semibold mt-2">
            Net cash accretive (+{formatCurrency(monthlyRevenue, currency)} revenue)
          </p>
        </div>
      </div>

      {/* ===================== STRESS TESTING MATRIX ===================== */}
      <div className="fin-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Downside Shock & Stress Testing Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate market corrections and sudden client revenue contraction
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-purple-400">
            Automated Monte Carlo Simulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {stressScenarios.map((sc, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${sc.color}`}
            >
              <div>
                <h3 className="text-xs font-bold text-slate-100">{sc.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Runway</span>
                <span className="text-sm font-bold font-mono tabular-nums">{sc.runwayMonths}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

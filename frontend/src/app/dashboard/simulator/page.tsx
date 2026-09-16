"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import {
  Sliders,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RotateCcw,
  Zap,
  ShieldCheck,
  Flame,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function SimulatorPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  // Simulation Levers
  const [incomeShiftPct, setIncomeShiftPct] = useState<number>(0); // -50% to +50%
  const [monthlySIP, setMonthlySIP] = useState<number>(35000); // 0 to 200,000
  const [oneTimePurchase, setOneTimePurchase] = useState<number>(0); // 0 to 2,000,000
  const [targetSavingsRate, setTargetSavingsRate] = useState<number>(65);

  const baselineIncome = 810000;
  const baselineExpense = 117750;
  const baselineLiquid = 788000;

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  // Calculated simulated values
  const simIncome = Math.round(baselineIncome * (1 + incomeShiftPct / 100));
  const simExpense = baselineExpense + (oneTimePurchase > 0 ? Math.round(oneTimePurchase / 12) : 0);
  const simNetFlow = simIncome - simExpense - monthlySIP;

  const simRunwayMonths = useMemo(() => {
    const remainingLiquid = Math.max(0, baselineLiquid - oneTimePurchase);
    if (simExpense <= 0) return 99;
    const months = remainingLiquid / simExpense;
    return months.toFixed(1);
  }, [oneTimePurchase, simExpense, baselineLiquid]);

  // Projected 5-Year Wealth Curve
  const projectionData = useMemo(() => {
    const data = [];
    let baseWealth = baselineLiquid;
    let simWealth = baselineLiquid - oneTimePurchase;

    for (let yr = 0; yr <= 5; yr++) {
      if (yr === 0) {
        data.push({
          year: "Year 0",
          Baseline: Math.round(baseWealth),
          Simulated: Math.round(simWealth),
        });
      } else {
        baseWealth = (baseWealth + (baselineIncome - baselineExpense) * 12) * 1.10;
        simWealth = (simWealth + (simIncome - baselineExpense) * 12 + monthlySIP * 12) * 1.12;
        data.push({
          year: `Year ${yr}`,
          Baseline: Math.round(baseWealth),
          Simulated: Math.round(simWealth),
        });
      }
    }
    return data;
  }, [incomeShiftPct, monthlySIP, oneTimePurchase, simIncome]);

  const loadScenario = (type: string) => {
    if (type === "drop30") {
      setIncomeShiftPct(-30);
      setOneTimePurchase(0);
      setMonthlySIP(20000);
    } else if (type === "car15L") {
      setIncomeShiftPct(0);
      setOneTimePurchase(1500000);
      setMonthlySIP(35000);
    } else if (type === "invest50k") {
      setIncomeShiftPct(10);
      setOneTimePurchase(0);
      setMonthlySIP(50000);
    } else {
      setIncomeShiftPct(0);
      setMonthlySIP(35000);
      setOneTimePurchase(0);
      setTargetSavingsRate(65);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Financial Decision Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            What-If Scenario Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Simulate revenue shifts, large capital acquisitions, and aggressive compounding schedules before executing decisions.
          </p>
        </div>

        <button
          onClick={() => loadScenario("reset")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121828] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold border border-white/[0.06] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* ===================== PRESET SCENARIO CHIPS ===================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-semibold mr-1">Quick Scenarios:</span>
        <button
          onClick={() => loadScenario("drop30")}
          className="px-3 py-1.5 rounded-lg bg-[#0E1422] border border-white/[0.06] hover:border-purple-500/40 text-xs font-medium text-slate-300 transition-colors shrink-0"
        >
          📉 What if income falls 30%?
        </button>
        <button
          onClick={() => loadScenario("car15L")}
          className="px-3 py-1.5 rounded-lg bg-[#0E1422] border border-white/[0.06] hover:border-purple-500/40 text-xs font-medium text-slate-300 transition-colors shrink-0"
        >
          🚗 What if I buy a ₹15L car?
        </button>
        <button
          onClick={() => loadScenario("invest50k")}
          className="px-3 py-1.5 rounded-lg bg-[#0E1422] border border-white/[0.06] hover:border-purple-500/40 text-xs font-medium text-slate-300 transition-colors shrink-0"
        >
          📈 What if I invest ₹50K/mo?
        </button>
      </div>

      {/* ===================== SIMULATION CONTROLS & OUTPUT ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5-Col Controls */}
        <div className="lg:col-span-5 fin-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Decision Variables & Levers
          </h2>

          {/* Income Shift Lever */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Income Shift</span>
              <span className={`font-mono font-bold ${incomeShiftPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {incomeShiftPct >= 0 ? "+" : ""}{incomeShiftPct}% ({formatCurrency(simIncome, currency)}/mo)
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={incomeShiftPct}
              onChange={(e) => setIncomeShiftPct(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Monthly Investment Lever */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Monthly SIP / Compounding</span>
              <span className="font-mono font-bold text-purple-400">
                {formatCurrency(monthlySIP, currency)}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={monthlySIP}
              onChange={(e) => setMonthlySIP(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* One-Time Purchase */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">One-Time Capital Outlay</span>
              <span className="font-mono font-bold text-amber-400">
                {formatCurrency(oneTimePurchase, currency)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="50000"
              value={oneTimePurchase}
              onChange={(e) => setOneTimePurchase(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Simulated Impact Metrics */}
          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Immediate Real-Time Impact
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#121828] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block">Simulated Runway</span>
                <span className="text-base font-bold text-purple-400 font-mono tabular-nums mt-0.5 block">
                  {simRunwayMonths} Months
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#121828] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block">Surplus Net Flow</span>
                <span className={`text-base font-bold font-mono tabular-nums mt-0.5 block ${simNetFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(simNetFlow, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 7-Col Projected Wealth Area Chart */}
        <div className="lg:col-span-7 fin-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-100">
                5-Year Wealth Trajectory Forecast
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400">
                12% CAGR Assumed
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Baseline organic trajectory versus your customized simulation scenario
            </p>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, currency, true)} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0B0F19] text-white p-3 rounded-xl shadow-2xl text-xs border border-white/10 font-mono">
                            <p className="font-sans font-bold text-slate-300 mb-1">{label}</p>
                            <p className="text-purple-400 font-bold">
                              Simulated: {formatCurrency(payload.find((p: any) => p.dataKey === "Simulated")?.value as number, currency)}
                            </p>
                            <p className="text-slate-400">
                              Baseline: {formatCurrency(payload.find((p: any) => p.dataKey === "Baseline")?.value as number, currency)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="Simulated" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#simGrad)" />
                  <Area type="monotone" dataKey="Baseline" stroke="#64748B" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#baseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-xs text-slate-400">
            <span>Projection incorporates compound returns & cashflow surplus.</span>
            <span className="text-purple-400 font-bold">Simulated +22% Alpha</span>
          </div>
        </div>
      </div>
    </div>
  );
}

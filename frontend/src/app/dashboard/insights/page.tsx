"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { aiAPI, analyticsAPI } from "../../../lib/api";
import { HealthScore } from "../../../lib/types";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Lightbulb,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

const CHART_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#06B6D4",
  "#6366F1",
  "#EF4444",
];

export default function InsightsPage() {
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [categoryComparison, setCategoryComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [insightsRes, recsRes, healthRes, catRes] = await Promise.all([
        aiAPI.insights(),
        aiAPI.recommendations(),
        analyticsAPI.healthScore(),
        analyticsAPI.categories(),
      ]);
      setInsights(insightsRes.data.insights || []);
      setRecommendations(recsRes.data.recommendations || []);
      setHealthScore(healthRes.data);
      setCategoryComparison(catRes.data || []);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-900 dark:text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO BANNER ===================== */}
      <div className="p-6 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Machine Learning Diagnostics & Optimization</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-outfit)] tracking-tight">
              AI Insights & Telemetry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Continuous audit of cashflow inefficiencies, spending leaks, tax deductions, and automated optimization tips.
            </p>
          </div>

          <Link
            href="/dashboard/advisor"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all self-start lg:self-auto"
          >
            <Bot className="w-4 h-4" /> Open Strategic AI Chat
          </Link>
        </div>
      </div>

      {/* ===================== AI INSIGHTS STREAM ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Insights Feed */}
        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Live Anomaly & Burn Audits
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              {insights.length} Detected
            </span>
          </div>

          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed flex items-start gap-2.5"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                <p className="flex-1">{insight}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                All spending telemetry normal. No anomalies identified.
              </div>
            )}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Optimization Recommendations
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Actionable
            </span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed flex items-start gap-2.5"
              >
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white mb-0.5">
                    {typeof rec === "string" ? rec : rec.title || rec.recommendation}
                  </p>
                  {typeof rec !== "string" && rec.detail && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {rec.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Continuous optimization pipeline running. Check back shortly.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== CATEGORY COMPARISON CHART ===================== */}
      {categoryComparison.length > 0 && (
        <div className="p-5 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Category Expenditure Telemetry
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Comparative analysis of operational cost centers
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {categoryComparison.length} Categories
            </span>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  tickFormatter={(v) => formatCurrency(v, currency, true)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                          <p className="font-bold capitalize">{label}</p>
                          <p className="font-mono font-extrabold text-purple-400 mt-1">
                            {formatCurrency(payload[0].value as number, currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {categoryComparison.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

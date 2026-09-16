'use client';

import React, { useState } from 'react';
import { 
  Sun, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  DollarSign,
  Coffee,
  PieChart,
  Target
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function FinancialBriefPage() {
  const [activeView, setActiveView] = useState<'daily' | 'weekly'>('daily');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Intelligence Briefing
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Financial Brief & Executive Review
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daily pulse and weekly retrospective synthesized by your Personal AI CFO.
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 border border-white/[0.08] rounded-xl">
          <button
            onClick={() => setActiveView('daily')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeView === 'daily'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Daily Brief
          </button>
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeView === 'weekly'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Weekly Review
          </button>
        </div>
      </div>

      {activeView === 'daily' ? (
        /* DAILY BRIEF VIEW */
        <div className="space-y-6 animate-fade-in">
          {/* Hero Greeting Card */}
          <div className="fin-card-elevated p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/20 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <span className="text-xs font-mono text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Monday, September 14, 2026
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Good Morning, Demo.
                </h2>
                <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                  Your financial position is <strong className="text-emerald-400">stronger than yesterday</strong>. Zero unexpected debits occurred overnight, and your net worth reached a new 30-day high.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col items-center justify-center text-center min-w-[180px]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Health Score</span>
                <div className="text-3xl font-extrabold text-emerald-400 my-1 tabular-nums">78 <span className="text-xs font-normal text-slate-500">/ 100</span></div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +6 pts this month
                </span>
              </div>
            </div>
          </div>

          {/* 3 Core Daily Snapshot Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="fin-card p-5 rounded-2xl border border-white/[0.06] bg-slate-900/40">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Net Worth Balance</span>
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +0.8%
                </span>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{formatCurrency(694050)}</div>
              <p className="text-[11px] text-slate-400 mt-1">Up ₹54,050 vs start of month</p>
            </div>

            <div className="fin-card p-5 rounded-2xl border border-white/[0.06] bg-slate-900/40">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Yesterday's Spending</span>
                <span className="text-slate-400 font-mono text-[10px]">3 Transactions</span>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{formatCurrency(3420)}</div>
              <p className="text-[11px] text-emerald-400 mt-1">Under daily baseline budget of ₹4,200</p>
            </div>

            <div className="fin-card p-5 rounded-2xl border border-white/[0.06] bg-slate-900/40">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Next Critical Obligation</span>
                <span className="text-amber-400 font-mono text-[10px]">In 4 Days</span>
              </div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(42850)}</div>
              <p className="text-[11px] text-slate-400 mt-1">HDFC Regalia Credit Card Due Sep 18</p>
            </div>
          </div>

          {/* AI Focus for Today */}
          <div className="fin-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              CFO Priority Directives for Today
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.04] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Emergency Fund Pace</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You are on track to fully fund your 6-month safety buffer (₹3,00,000) <strong>2 months ahead of schedule</strong> if your September savings rate holds above 80%.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.04] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Cash Liquidity Buffer Checked</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Checking account has ₹2,84,000 in liquid reserves. After the Sep 18 card debit of ₹42,850, balance remains comfortably at ₹2,41,150—well above your ₹75,000 cash floor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* WEEKLY REVIEW VIEW */
        <div className="space-y-6 animate-fade-in">
          <div className="fin-card-elevated p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Executive Retrospective</span>
                <h2 className="text-2xl font-bold text-white">Your Week in Money</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Sep 07 – Sep 13, 2026</span>
            </div>

            {/* Weekly Flow Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-xs text-slate-400">Total Income Inflow</span>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums my-1">{formatCurrency(210000)}</div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> +12% vs prior week
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-xs text-slate-400">Total Capital Outflow</span>
                <div className="text-2xl font-bold text-white tabular-nums my-1">{formatCurrency(28450)}</div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingDown className="w-3 h-3" /> -6% vs prior week (Disciplined)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-xs text-slate-400">Net Surplus Accumulated</span>
                <div className="text-2xl font-bold text-purple-400 tabular-nums my-1">{formatCurrency(181550)}</div>
                <span className="text-[11px] text-purple-300 font-medium">
                  86.4% Net Savings Velocity
                </span>
              </div>
            </div>

            {/* What Changed / Retrospective Insights */}
            <div className="pt-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Key Retrospective Observations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    What Improved
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Food & Dining spending stayed 14% below target. Retained surplus was redirected to index equity.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    What Needs Attention
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Cloud infrastructure bills ticked up by ₹4,800 due to active compute nodes. Review AWS instance sizing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

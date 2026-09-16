'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  Wallet, 
  DollarSign, 
  TrendingDown, 
  Target, 
  ArrowRight, 
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { getSetupChecklist, updateSetupChecklist, setDemoModeActive } from '@/lib/demo-store';

export default function FreshStartChecklist() {
  const [checklist, setChecklist] = useState(getSetupChecklist());

  useEffect(() => {
    setChecklist(getSetupChecklist());
    const handleChecklistChange = (e: any) => {
      if (e.detail) setChecklist(e.detail);
    };
    window.addEventListener('finai:checklist-change', handleChecklistChange);
    return () => window.removeEventListener('finai:checklist-change', handleChecklistChange);
  }, []);

  const completedCount = [
    checklist.accountAdded,
    checklist.incomeAdded,
    checklist.expensesAdded,
    checklist.goalCreated,
  ].filter(Boolean).length;

  const handleRestoreDemo = () => {
    setDemoModeActive(true);
    window.location.reload();
  };

  const steps = [
    {
      id: 'account',
      title: '1. Add your first account',
      desc: 'Link a bank, credit card, or investment account to calculate Net Worth.',
      href: '/dashboard/accounts',
      completed: checklist.accountAdded,
      icon: Wallet
    },
    {
      id: 'income',
      title: '2. Add income inflow',
      desc: 'Record your primary salary, consulting revenue, or business dividends.',
      href: '/dashboard/income',
      completed: checklist.incomeAdded,
      icon: DollarSign
    },
    {
      id: 'expenses',
      title: '3. Track your first expense',
      desc: 'Log expenses to calibrate monthly burn rate and runway projections.',
      href: '/dashboard/expenses',
      completed: checklist.expensesAdded,
      icon: TrendingDown
    },
    {
      id: 'goal',
      title: '4. Create a financial milestone',
      desc: 'Set an emergency fund, home downpayment, or retirement target.',
      href: '/dashboard/goals',
      completed: checklist.goalCreated,
      icon: Target
    }
  ];

  return (
    <div className="fin-card-elevated p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-[#0E1422] to-purple-950/20 shadow-2xl space-y-6 animate-fin-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              FINANCIAL OS INITIALIZED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Your financial OS is ready.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete the 4 baseline milestones below to activate automated cash flow telemetry and AI reasoning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-mono">Setup Progress</span>
            <span className="text-lg font-bold text-purple-400 font-mono">{completedCount} / 4</span>
          </div>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.id}
              href={s.href}
              className={`p-4 rounded-2xl border transition duration-200 flex items-start justify-between gap-3 group ${
                s.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900/80 border-white/[0.08] hover:border-purple-500/40 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  s.completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                {s.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition group-hover:translate-x-0.5" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom helper */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <span>Want to preview FinAI with pre-populated multi-asset metrics?</span>
        <button
          onClick={handleRestoreDemo}
          className="text-purple-400 hover:text-purple-300 font-semibold underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Switch back to Demo Mode</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Sparkles, TrendingUp, ShieldCheck, Zap, ArrowUpRight, Lock, BrainCircuit } from 'lucide-react';

export default function AuthBrandPanel() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-12 xl:p-16 overflow-hidden bg-[#070A10] border-r border-white/[0.06]">
      {/* Subtle Ambient Glows (Restrained) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-950/20 blur-3xl pointer-events-none" />
      
      {/* Background Subtle Grid Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Brand Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">FinAI Pro</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest bg-purple-500/15 text-purple-300 border border-purple-500/20">
                AI OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Autonomous Financial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Center Value Proposition */}
      <div className="relative z-10 my-auto py-8 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Next-Gen Financial Architecture</span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Your money.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400">
              Understood by AI.
            </span>
          </h1>

          <p className="text-sm lg:text-base text-slate-300 max-w-lg leading-relaxed font-normal">
            Understand your finances, predict what is next, and make smarter capital allocation decisions with an AI-powered financial operating system.
          </p>
        </div>

        {/* 3 Core Value Props */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span><strong>Personalized AI Copilot</strong> with full telemetry and scenario simulation</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <TrendingUp className="w-3 h-3" />
            </div>
            <span><strong>Deterministic Cash Flow Forecasting</strong> & runway preservation</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-3 h-3" />
            </div>
            <span><strong>Autonomous Autopilot Guardrails</strong> with zero unauthorized actions</span>
          </div>
        </div>

        {/* Ambient Telemetry Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] max-w-sm backdrop-blur-sm space-y-2 shadow-2xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              Live Telemetry Sample
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPTIMIZED
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-bold text-white tabular-nums">₹9,00,400</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +8.4% this month
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Runway expanded to 6.7 months. 0 budget violations.
          </p>
        </div>
      </div>

      {/* Bottom Security Footer */}
      <div className="relative z-10 flex items-center gap-4 text-xs text-slate-400 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">256-Bit Hardware Encryption</span>
        </div>
        <span className="text-slate-600">•</span>
        <span className="text-[11px]">Zero-Knowledge Privacy</span>
      </div>
    </div>
  );
}

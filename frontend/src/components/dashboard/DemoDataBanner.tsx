'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { isDemoModeActive, setDemoModeActive, resetAllFinancialData } from '@/lib/demo-store';

export default function DemoDataBanner() {
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>('');

  useEffect(() => {
    setIsDemo(isDemoModeActive());

    const handleDemoChange = (e: any) => {
      if (e.detail?.isDemo !== undefined) {
        setIsDemo(e.detail.isDemo);
      } else {
        setIsDemo(isDemoModeActive());
      }
    };

    window.addEventListener('finai:demo-mode-change', handleDemoChange);
    return () => window.removeEventListener('finai:demo-mode-change', handleDemoChange);
  }, []);

  const handleDeleteDemo = () => {
    resetAllFinancialData();
    setShowConfirmModal(false);
    setConfirmInput('');
  };

  const handleRestoreDemo = () => {
    setDemoModeActive(true);
    window.location.reload();
  };

  if (!isDemo) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Live Workspace (Real User Data Mode)</span>
        </div>
        <button
          onClick={handleRestoreDemo}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Explore Demo Data</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Demo Mode Active</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SAMPLE DATA
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Exploring simulated high-velocity startup cash flows and AI telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Start Fresh</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md fin-card-elevated rounded-2xl border border-rose-500/30 bg-[#0E1422] shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Clear Demo Data & Start Fresh</h3>
                  <p className="text-xs text-slate-400">Initialize your blank financial operating system</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-rose-400 font-bold block mb-1 uppercase font-mono text-[10px]">What will be deleted:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                  <li>Sample accounts, bank balances & liabilities</li>
                  <li>Simulated transactions & classified categories</li>
                  <li>Demo budgets, goals, and recurring SaaS bills</li>
                  <li>Simulated AI insights and anomaly history</li>
                </ul>
              </div>

              <div className="border-t border-white/5 pt-2">
                <span className="text-emerald-400 font-bold block mb-1 uppercase font-mono text-[10px]">What will be preserved:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                  <li>Your user profile and session credentials</li>
                  <li>Theme and custom currency preferences</li>
                  <li>Security policies and 2FA settings</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDemo}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Start Fresh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

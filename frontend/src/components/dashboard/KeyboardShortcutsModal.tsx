'use client';

import React from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'Global Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open Command Center' },
      { keys: ['G', 'D'], label: 'Go to Dashboard' },
      { keys: ['G', 'T'], label: 'Go to Transactions' },
      { keys: ['G', 'A'], label: 'Go to Accounts' },
      { keys: ['G', 'G'], label: 'Go to Goals' },
      { keys: ['G', 'I'], label: 'Go to Investments' },
      { keys: ['G', 'S'], label: 'Go to Simulator' },
      { keys: ['G', 'C'], label: 'Go to AI Copilot' },
    ]
  },
  {
    title: 'Quick Actions',
    shortcuts: [
      { keys: ['N', 'E'], label: 'New Expense Entry' },
      { keys: ['N', 'I'], label: 'New Income Deposit' },
      { keys: ['N', 'G'], label: 'New Goal' },
      { keys: ['?'], label: 'Open Keyboard Shortcuts' },
      { keys: ['ESC'], label: 'Close Modals & Drawers' },
    ]
  }
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg fin-card-elevated rounded-2xl border border-white/10 bg-[#0E1422] shadow-2xl overflow-hidden p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Boost your financial navigation speed</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Groups */}
        <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                {group.title}
              </span>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.04] text-xs"
                  >
                    <span className="text-slate-300 font-medium">{sc.label}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold text-slate-200 bg-slate-800 border border-white/10 shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 font-mono pt-2 border-t border-white/[0.06]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">?</kbd> anywhere to toggle this guide
        </div>
      </div>
    </div>
  );
}

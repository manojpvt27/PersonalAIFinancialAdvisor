'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  Flame, 
  Target, 
  Bot, 
  Settings, 
  Plus, 
  TrendingUp, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Quick Actions' | 'AI & Intelligence' | 'Settings';
  icon: any;
  shortcut?: string;
  action: () => void;
}

interface CommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandCenterModal({ isOpen, onClose }: CommandCenterModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: 'act-expense',
      title: 'Add New Expense',
      category: 'Quick Actions',
      icon: Plus,
      shortcut: 'N E',
      action: () => { router.push('/dashboard/expenses'); onClose(); }
    },
    {
      id: 'act-income',
      title: 'Add New Income Inflow',
      category: 'Quick Actions',
      icon: Plus,
      shortcut: 'N I',
      action: () => { router.push('/dashboard/income'); onClose(); }
    },
    {
      id: 'act-goal',
      title: 'Create Financial Goal',
      category: 'Quick Actions',
      icon: Target,
      action: () => { router.push('/dashboard/goals'); onClose(); }
    },
    {
      id: 'act-simulate',
      title: 'Launch What-If Simulator',
      category: 'AI & Intelligence',
      icon: Sliders,
      shortcut: 'G S',
      action: () => { router.push('/dashboard/simulator'); onClose(); }
    },
    // Navigation
    {
      id: 'nav-dash',
      title: 'Executive Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'G D',
      action: () => { router.push('/dashboard'); onClose(); }
    },
    {
      id: 'nav-accounts',
      title: 'Accounts & Balance Sheet',
      category: 'Navigation',
      icon: Wallet,
      shortcut: 'G A',
      action: () => { router.push('/dashboard/accounts'); onClose(); }
    },
    {
      id: 'nav-tx',
      title: 'Transaction Intelligence',
      category: 'Navigation',
      icon: ArrowLeftRight,
      shortcut: 'G T',
      action: () => { router.push('/dashboard/transactions'); onClose(); }
    },
    {
      id: 'nav-copilot',
      title: 'AI Financial Copilot & Advisor',
      category: 'AI & Intelligence',
      icon: Bot,
      shortcut: 'G C',
      action: () => { router.push('/dashboard/advisor'); onClose(); }
    },
    {
      id: 'nav-runway',
      title: 'Financial Runway & Founder Burn',
      category: 'AI & Intelligence',
      icon: Flame,
      shortcut: 'G R',
      action: () => { router.push('/dashboard/runway'); onClose(); }
    },
    {
      id: 'nav-brief',
      title: 'Daily Brief & Weekly Review',
      category: 'AI & Intelligence',
      icon: Sparkles,
      shortcut: 'G B',
      action: () => { router.push('/dashboard/brief'); onClose(); }
    },
    {
      id: 'nav-autopilot',
      title: 'Financial Autopilot Policy Engine',
      category: 'AI & Intelligence',
      icon: Zap,
      action: () => { router.push('/dashboard/autopilot'); onClose(); }
    },
    {
      id: 'nav-settings',
      title: 'System Settings & Preferences',
      category: 'Settings',
      icon: Settings,
      action: () => { router.push('/dashboard/settings'); onClose(); }
    },
  ];

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl fin-card-elevated rounded-2xl border border-purple-500/30 bg-[#0E1422] shadow-2xl overflow-hidden animate-fin-fade"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#121828]">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search pages, actions, AI commands, or type a query..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-white/10 shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition duration-150 ${
                    isSelected 
                      ? 'bg-purple-600/20 text-white border border-purple-500/30' 
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold block text-white">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-white/5">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#090D18] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Navigate: ↑ ↓</span>
          <span>Select: ↵</span>
          <span>Command Center: ⌘K</span>
        </div>
      </div>
    </div>
  );
}

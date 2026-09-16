'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Sliders, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Lock,
  RefreshCw,
  Bell,
  Zap,
  Clock,
  Info
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface AutopilotRule {
  id: string;
  name: string;
  trigger: string;
  targetCondition: string;
  action: string;
  type: 'emergency_buffer' | 'cash_floor' | 'auto_invest' | 'burn_guard' | 'goal_track';
  status: 'active' | 'paused' | 'trigger_pending';
  lastEvaluated: string;
  impact: string;
  requiresAuth: boolean;
}

const initialRules: AutopilotRule[] = [
  {
    id: 'rule-1',
    name: 'Emergency Fund Guardrail',
    trigger: 'Monthly Savings Sweep',
    targetCondition: 'Maintain ₹3,00,000 in Liquid Sweep Account',
    action: 'Route excess cash over ₹3L into Nifty 50 Index SIP automatically',
    type: 'emergency_buffer',
    status: 'active',
    lastEvaluated: 'Today at 08:30 AM',
    impact: '₹42,500 queued for auto-allocation on Sep 30',
    requiresAuth: true
  },
  {
    id: 'rule-2',
    name: 'Primary Checking Cash Floor',
    trigger: 'Operating Balance < ₹75,000',
    targetCondition: 'Keep checking account above ₹75,000 baseline',
    action: 'Alert CFO & pause discretionary auto-debits if buffer dips',
    type: 'cash_floor',
    status: 'active',
    lastEvaluated: 'Today at 12:15 PM',
    impact: 'Current balance ₹2,84,000 (Safe headroom: ₹2,09,000)',
    requiresAuth: false
  },
  {
    id: 'rule-3',
    name: 'Monthly Savings Velocity Engine',
    trigger: 'Income Deposit Detected',
    targetCondition: 'Auto-allocate 25% of all net revenues to Long-term Goals',
    action: 'Split between Tech ETF (60%) and High-Yield Debt (40%)',
    type: 'auto_invest',
    status: 'active',
    lastEvaluated: 'Yesterday at 05:40 PM',
    impact: '₹1,50,000 systematically deployed this month',
    requiresAuth: true
  },
  {
    id: 'rule-4',
    name: 'Discretionary Burn Cap Alert',
    trigger: 'Monthly Expense Velocity > ₹1,50,000',
    targetCondition: 'Alert when total monthly burn breaches ₹1.5L ceiling',
    action: 'Issue high-priority push notification & trigger budget lockdown advice',
    type: 'burn_guard',
    status: 'active',
    lastEvaluated: '10 mins ago',
    impact: 'Current burn ₹1,17,750 (78.5% of cap utilized)',
    requiresAuth: false
  },
  {
    id: 'rule-5',
    name: 'Goal Drift Auto-Correction',
    trigger: 'Goal Milestone Variance > -5%',
    targetCondition: 'Keep Startup Runway & House Downpayment on track',
    action: 'Generate dynamic surplus rebalancing plan to restore schedule',
    type: 'goal_track',
    status: 'trigger_pending',
    lastEvaluated: '2 hours ago',
    impact: 'House goal is 4 days behind schedule. Rebalance suggested.',
    requiresAuth: true
  }
];

export default function AutopilotPage() {
  const [rules, setRules] = useState<AutopilotRule[]>(initialRules);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending'>('all');
  const [pendingActionModal, setPendingActionModal] = useState<AutopilotRule | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: r.status === 'active' ? 'paused' : 'active'
        };
      }
      return r;
    }));
  };

  const handleAuthorize = (rule: AutopilotRule) => {
    setActionSuccess(`Rule "${rule.name}" approved. Recommendation staged for execution with audit log #AI-${Date.now().toString().slice(-5)}.`);
    setPendingActionModal(null);
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: 'active', impact: 'Executed successfully. Next check scheduled in 24h.' } : r));
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const filteredRules = rules.filter(r => {
    if (activeTab === 'active') return r.status === 'active';
    if (activeTab === 'pending') return r.status === 'trigger_pending';
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              FINANCIAL AUTOPILOT ENGINE
            </span>
            <span className="text-xs text-slate-400">Autonomous Financial Guardrails</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Financial Autopilot & Guardrails
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Continuous recommendation-first policy engine that enforces budget ceilings, liquidity floors, and wealth acceleration rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActionSuccess('All 5 rules evaluated against live account balances. System in equilibrium.')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Evaluate Live Rules
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-500/20 transition">
            <Plus className="w-4 h-4" />
            Create Autopilot Policy
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in text-emerald-400 text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Autopilot Philosophy & Safety Guarantee Banner */}
      <div className="fin-card-elevated p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Recommendation-First Execution Guarantee
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Zero Non-Authorized Transactions
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                FinAI Autopilot operates on a deterministic policy framework. All automated transfers, reallocations, and asset liquidations require explicit cryptographic or 2FA approval before execution. You stay in total control.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-white/5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>256-Bit HSM Verification</span>
          </div>
        </div>
      </div>

      {/* Policy Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fin-card p-4 rounded-xl border border-white/[0.06] bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active Policies</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">4 <span className="text-xs text-slate-500 font-normal">/ 5 Total</span></div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Continuous 24/7 Monitoring
          </p>
        </div>

        <div className="fin-card p-4 rounded-xl border border-white/[0.06] bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums">1 Action</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Goal drift auto-correction waiting review
          </p>
        </div>

        <div className="fin-card p-4 rounded-xl border border-white/[0.06] bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Capital Swept YTD</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{formatCurrency(450000)}</div>
          <p className="text-[11px] text-emerald-400 mt-1">
            +₹38,200 estimated compounding gain
          </p>
        </div>

        <div className="fin-card p-4 rounded-xl border border-white/[0.06] bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Safety Buffer Status</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">100% Intact</div>
          <p className="text-[11px] text-slate-400 mt-1">
            6.7 months fixed burn covered
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all' 
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              All Policies ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'active' 
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Active ({rules.filter(r => r.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'pending' 
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Pending Approval ({rules.filter(r => r.status === 'trigger_pending').length})
            </button>
          </div>
          <span className="text-xs text-slate-500">Evaluates on transaction sync & daily chronometer</span>
        </div>

        <div className="space-y-3">
          {filteredRules.map((rule) => {
            const isPending = rule.status === 'trigger_pending';
            const isActive = rule.status === 'active';

            return (
              <div 
                key={rule.id}
                className={`fin-card p-5 rounded-2xl border transition-all duration-200 ${
                  isPending 
                    ? 'border-amber-500/40 bg-amber-950/10' 
                    : isActive 
                      ? 'border-white/[0.08] hover:border-purple-500/30' 
                      : 'border-white/[0.04] opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {rule.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPending ? 'Action Required' : isActive ? 'Active Guardrail' : 'Paused'}
                      </span>
                      {rule.requiresAuth && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Auth Required
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.04]">
                        <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider mb-0.5">Policy Target & Rule</span>
                        <span className="text-slate-200 font-medium">{rule.targetCondition}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.04]">
                        <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider mb-0.5">Autonomous Action</span>
                        <span className="text-purple-300 font-medium">{rule.action}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="text-slate-300 font-mono text-[11px] bg-slate-800/60 px-2 py-0.5 rounded">
                        Impact: {rule.impact}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Last evaluated: {rule.lastEvaluated}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Toggles */}
                  <div className="flex items-center gap-3 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                    {isPending ? (
                      <button
                        onClick={() => setPendingActionModal(rule)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Review Recommendation
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isActive 
                            ? 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700' 
                            : 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    )}
                    <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {pendingActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="fin-card-elevated p-6 rounded-2xl max-w-lg w-full border border-amber-500/30 bg-slate-900 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{pendingActionModal.name}</h3>
                  <p className="text-xs text-amber-400">Trigger condition met. Authorization required.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-400 block mb-1 uppercase font-mono text-[10px]">Diagnosis:</span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  The <strong className="text-white">House Downpayment Goal</strong> target pace fell from ₹35,000/mo to ₹31,200/mo due to an unexpected hardware purchase last week.
                </p>
              </div>

              <div className="border-t border-white/5 pt-2">
                <span className="text-slate-400 block mb-1 uppercase font-mono text-[10px]">AI Autopilot Proposed Action:</span>
                <p className="text-purple-300 font-medium">
                  Rebalance ₹3,800 from Discretionary Dining surplus into the House SIP on Oct 1.
                </p>
              </div>

              <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Projected Recovery:</span>
                <span className="text-emerald-400 font-semibold">100% on schedule for 2028</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingActionModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleAuthorize(pendingActionModal)}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-lg shadow-emerald-400/20 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Authorize Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

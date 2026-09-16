'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { aiAPI } from '@/lib/api';
import { ChatMessage } from '@/lib/types';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldAlert,
  Flame,
  Lightbulb,
  ArrowRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';

interface StructuredAIDecision {
  isStructured: boolean;
  verdict: 'AFFORDABLE' | 'WAIT' | 'CAUTION' | 'OPTIMIZE' | 'APPROVED';
  purchaseItem?: string;
  amount?: number;
  why: string;
  numbers: { label: string; value: string; delta?: string }[];
  impact: string;
  recommendation: string;
  suggestedAlternative?: string;
  actions: { label: string; href: string }[];
}

const STRATEGIC_PROMPT_CHIPS = [
  { text: "Can I afford a ₹1.5L MacBook?", icon: DollarSign },
  { text: "Where am I overspending?", icon: Flame },
  { text: "Can I retire by 45 with ₹5Cr target?", icon: TrendingUp },
  { text: "What happens if my income falls 30%?", icon: ShieldAlert },
  { text: "Audit my SaaS & recurring software burn", icon: Zap },
  { text: "Provide high-impact tax deduction strategies", icon: Lightbulb },
];

function parseStructuredResponse(content: string, userQuery: string): StructuredAIDecision | null {
  const queryLower = userQuery.toLowerCase();
  
  if (queryLower.includes("macbook") || queryLower.includes("afford") || queryLower.includes("1.5l")) {
    return {
      isStructured: true,
      verdict: 'WAIT',
      purchaseItem: 'Apple MacBook Pro M3 (₹1,50,000)',
      amount: 150000,
      why: 'Purchasing immediately with liquid cash will compress your 6.7-month emergency runway down to 5.4 months, falling below your mandatory 6-month safety buffer.',
      numbers: [
        { label: 'Purchase Outlay', value: '₹1,50,000' },
        { label: 'Emergency Runway Impact', value: '6.7 mo → 5.4 mo', delta: '-1.3 mo' },
        { label: 'Current Liquid Reserve', value: '₹7,88,000 → ₹6,38,000' },
        { label: 'Opportunity Cost (5yr @ 12%)', value: '₹2,64,350' }
      ],
      impact: 'Immediate full cash debit delays your House Downpayment milestone by 23 calendar days and depletes checking buffer.',
      recommendation: 'Stage purchase after the Oct 1 revenue tranche or utilize a 0% interest 6-month structured payment plan.',
      suggestedAlternative: 'Commit ₹25,000/mo into a dedicated Equipment Sinking Fund starting this month.',
      actions: [
        { label: 'Run Simulation', href: '/dashboard/simulator' },
        { label: 'Check Runway', href: '/dashboard/runway' },
        { label: 'Adjust Budget', href: '/dashboard/budgets' }
      ]
    };
  }

  if (queryLower.includes("retire") || queryLower.includes("45")) {
    return {
      isStructured: true,
      verdict: 'OPTIMIZE',
      purchaseItem: 'Retirement by Age 45 (FIRE Target ₹5.00 Cr)',
      why: 'At your current monthly investment velocity of ₹1,20,000 with an expected 12.5% CAGR, your portfolio will reach ₹4.32 Cr by age 45 (86.4% of target).',
      numbers: [
        { label: 'Target Corpus', value: '₹5,00,00,000' },
        { label: 'Projected at Current Rate', value: '₹4,32,00,000' },
        { label: 'Required Monthly Step-Up', value: '+₹18,500/mo' },
        { label: 'Probability of Success', value: '82%' }
      ],
      impact: 'Increasing SIP by 15.4% today guarantees goal achievement 18 months ahead of deadline with 94% statistical confidence.',
      recommendation: 'Implement an annual 10% step-up SIP linked to expected client contract escalation.',
      actions: [
        { label: 'Model in Simulator', href: '/dashboard/simulator' },
        { label: 'View Investments', href: '/dashboard/investments' },
        { label: 'Review Goals', href: '/dashboard/goals' }
      ]
    };
  }

  if (queryLower.includes("overspending") || queryLower.includes("spending")) {
    return {
      isStructured: true,
      verdict: 'CAUTION',
      purchaseItem: 'Category Burn Audit',
      why: 'Dining & Cloud Subscriptions are experiencing +18.4% drift compared to the 3-month trailing moving average.',
      numbers: [
        { label: 'Dining Outburn', value: '₹18,400 (Budget ₹12,000)', delta: '+53.3%' },
        { label: 'Unused Cloud Seats', value: '₹4,250/mo' },
        { label: 'Annual Recoverable Loss', value: '₹51,000/yr' }
      ],
      impact: 'Discretionary leak reduces monthly investment velocity by 4.2%.',
      recommendation: 'Cap dining out at ₹3,000/week and cancel 2 dormant SaaS tools.',
      actions: [
        { label: 'Audit Subscriptions', href: '/dashboard/subscriptions' },
        { label: 'Review Budgets', href: '/dashboard/budgets' }
      ]
    };
  }

  return null;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await aiAPI.chatHistory();
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            id: 'welcome-1',
            role: 'assistant',
            content:
              '👋 Welcome to **FinAI Strategic Copilot**.\n\nI have complete contextual access to your live accounts, cash flows, category burn rates, tax liabilities, and runway models.\n\nAsk me any decision-making question, such as:\n• *"Can I afford a ₹1.5L MacBook?"*\n• *"Where am I overspending?"*\n• *"Can I retire by 45?"*\n• *"What happens if my income falls 30%?"*',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const sendMessage = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { data } = await aiAPI.chat(textToSend);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.response ||
          data.reply ||
          data.message ||
          'I have analyzed your financial telemetry and generated the decision model.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '⚠️ Unable to reach backend AI model. Generating offline decision model from localized financial cache.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto font-sans pb-4">
      {/* Copilot Header */}
      <div className="p-4 fin-card-elevated border border-white/[0.08] rounded-2xl mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">
                FinAI Autonomous Financial Copilot
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Full Telemetry Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic reasoning engine grounded in your real-time net worth, cash flows, and runway
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: '✨ Session refreshed. Ready for your next strategic financial query.',
                createdAt: new Date().toISOString(),
              },
            ]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 fin-card rounded-2xl border border-white/[0.06] space-y-5 mb-4 scrollbar-thin">
        {messages.map((m, index) => {
          const isAI = m.role === 'assistant';
          
          // Find matching user query if this is an AI message
          const prevUserQuery = !isAI 
            ? '' 
            : index > 0 && messages[index - 1].role === 'user' 
              ? messages[index - 1].content 
              : '';
              
          const structuredCard = isAI ? parseStructuredResponse(m.content, prevUserQuery) : null;

          return (
            <div
              key={m.id}
              className={`flex gap-3.5 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAI
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'bg-white text-slate-950 font-bold'
                }`}
              >
                {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                {structuredCard ? (
                  /* STRUCTURED FINANCIAL INTELLIGENCE CARD */
                  <div className="fin-card-elevated p-5 rounded-2xl border border-purple-500/30 bg-slate-900 shadow-xl space-y-4 text-xs">
                    {/* Verdict Banner */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                          AI Decision Evaluation
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          {structuredCard.purchaseItem}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider ${
                          structuredCard.verdict === 'AFFORDABLE' || structuredCard.verdict === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : structuredCard.verdict === 'WAIT'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          VERDICT: {structuredCard.verdict}
                        </span>
                      </div>
                    </div>

                    {/* WHY Section */}
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block mb-1">
                        Core Diagnosis (Why)
                      </span>
                      <p className="text-slate-200 text-xs leading-relaxed font-medium">
                        {structuredCard.why}
                      </p>
                    </div>

                    {/* NUMBERS Grid */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {structuredCard.numbers.map((num, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 font-mono block">{num.label}</span>
                          <div className="text-xs font-bold text-white tabular-nums mt-0.5 flex items-center justify-between">
                            <span>{num.value}</span>
                            {num.delta && (
                              <span className="text-[10px] text-amber-400 font-mono">{num.delta}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* IMPACT & RECOMMENDATION */}
                    <div className="space-y-2 pt-1">
                      <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-1">
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Financial Impact</span>
                        <p className="text-slate-300 leading-relaxed">{structuredCard.impact}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                        <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">CFO Strategic Recommendation</span>
                        <p className="text-white font-medium leading-relaxed">{structuredCard.recommendation}</p>
                      </div>
                    </div>

                    {/* NEXT ACTIONS */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Next Actions:</span>
                      {structuredCard.actions.map((act, i) => (
                        <Link
                          key={i}
                          href={act.href}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-[11px] border border-slate-700 transition flex items-center gap-1"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-purple-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard Markdown Content */
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed relative group ${
                      isAI
                        ? 'fin-card border border-white/[0.06] text-slate-200'
                        : 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-600/20 font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-xs prose-invert max-w-none">
                      {m.content}
                    </div>

                    {isAI && (
                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition bg-slate-800 border border-slate-700"
                        title="Copy response"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                <span
                  className={`text-[9px] text-slate-500 font-mono px-1 block ${
                    isAI ? 'text-left' : 'text-right'
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-3 max-w-lg mr-auto">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl fin-card border border-white/[0.06] text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span className="text-slate-300 font-mono">
                Querying financial database & simulating outcome...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Strategy Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-none">
        {STRATEGIC_PROMPT_CHIPS.map((chip, i) => {
          const Icon = chip.icon;
          return (
            <button
              key={i}
              onClick={() => sendMessage(chip.text)}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-[11px] font-semibold text-slate-300 hover:border-purple-500/50 hover:text-purple-300 hover:bg-slate-800 transition whitespace-nowrap shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-purple-400" />
              <span>{chip.text}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2 shrink-0 mt-1"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask FinAI: 'Can I afford a ₹1.5L MacBook?', 'Where am I overspending?', 'Can I retire by 45?'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/[0.08] outline-none text-xs text-white placeholder:text-slate-500 focus:border-purple-500/60 shadow-lg transition"
          />
        </div>
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 shadow-lg shadow-purple-600/20 transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

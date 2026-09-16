import React from "react";
import { Sparkles, ArrowRight, Flame, TrendingUp, ShieldAlert, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";

interface AIIntelligenceFeedProps {
  currency: SupportedCurrency;
  onNavigateToAdvisor?: () => void;
}

export const AIIntelligenceFeed: React.FC<AIIntelligenceFeedProps> = ({
  currency,
  onNavigateToAdvisor,
}) => {
  const insights = [
    {
      id: "insight-1",
      number: "INSIGHT 01",
      badge: "OPTIMIZATION",
      badgeColor: "text-amber-400 bg-amber-500/10",
      title: "Subscription spending increased 14%",
      impactLabel: "Potential monthly saving:",
      impactValue: formatCurrency(4250, currency),
      impactType: "positive",
      ctaLabel: "Review subscriptions",
      ctaHref: "/dashboard/expenses?category=subscriptions",
      icon: Flame,
    },
    {
      id: "insight-2",
      number: "INSIGHT 02",
      badge: "ON TRACK",
      badgeColor: "text-emerald-400 bg-emerald-500/10",
      title: "You are ahead of your savings target",
      impactLabel: "Current: 85% • Target: 70%",
      impactValue: "+15% Velocity",
      impactType: "neutral",
      ctaLabel: "View strategy",
      ctaHref: "/dashboard/goals",
      icon: TrendingUp,
    },
    {
      id: "insight-3",
      number: "INSIGHT 03",
      badge: "RUNWAY",
      badgeColor: "text-purple-400 bg-purple-500/10",
      title: "Your cash runway improved",
      impactLabel: "Runway trajectory:",
      impactValue: "5.9 mo → 6.7 mo",
      impactType: "neutral",
      ctaLabel: "See forecast",
      ctaHref: "/dashboard/advisor",
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="fin-card p-5 lg:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              AI Financial Intelligence
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">3 Opportunities</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Your financial copilot analyzed 42 transactions and found 3 opportunities.
        </p>

        {/* 3 Insight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#121828] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500">
                      {item.number}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-200 leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block">{item.impactLabel}</span>
                    <span className="text-xs font-bold text-slate-100 font-mono tabular-nums mt-0.5 block">
                      {item.impactValue}
                    </span>
                  </div>
                </div>

                <Link
                  href={item.ctaHref}
                  className="mt-4 pt-2.5 border-t border-white/[0.06] text-[11px] font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 group transition-colors"
                >
                  <span>{item.ctaLabel}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">Continuous automated financial telemetry</span>
        <Link
          href="/dashboard/advisor"
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <span>Ask Copilot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

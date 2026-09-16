import React from "react";
import { AlertCircle, ArrowRight, Bell, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";

interface AttentionSectionProps {
  currency: SupportedCurrency;
}

export const AttentionSection: React.FC<AttentionSectionProps> = ({ currency }) => {
  const items = [
    {
      id: "att-1",
      level: "critical",
      indicatorColor: "bg-rose-500",
      type: "Subscription renewal",
      title: "AWS & GPU Cluster Compute",
      amount: formatCurrency(14200, currency),
      dueDate: "Tomorrow",
      actionText: "Manage",
      actionHref: "/dashboard/expenses?category=subscriptions",
    },
    {
      id: "att-2",
      level: "warning",
      indicatorColor: "bg-amber-500",
      type: "Budget approaching limit",
      title: "Shopping & Hardware",
      amount: "82% consumed",
      dueDate: "3 days left in cycle",
      actionText: "Adjust cap",
      actionHref: "/dashboard/budgets",
    },
    {
      id: "att-3",
      level: "success",
      indicatorColor: "bg-emerald-500",
      type: "Goal milestone reached",
      title: "Emergency Fund",
      amount: "80% completed",
      dueDate: "Ahead of schedule",
      actionText: "Allocate",
      actionHref: "/dashboard/goals",
    },
  ];

  return (
    <div className="fin-card p-5 lg:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              Needs Your Attention
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
              3 Items
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Actionable triggers requiring review or capital rebalancing
        </p>

        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#121828] border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.indicatorColor}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-500">• {item.dueDate}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                    {item.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-slate-100 tabular-nums">
                  {item.amount}
                </span>
                <Link
                  href={item.actionHref}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-semibold text-slate-200 transition-colors"
                >
                  {item.actionText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

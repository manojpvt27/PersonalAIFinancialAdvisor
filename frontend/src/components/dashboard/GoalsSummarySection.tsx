import React from "react";
import { Plus, Target, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Goal } from "../../lib/types";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";

interface GoalsSummarySectionProps {
  goals: Goal[];
  currency: SupportedCurrency;
  onOpenNewGoal?: () => void;
}

export const GoalsSummarySection: React.FC<GoalsSummarySectionProps> = ({
  goals,
  currency,
  onOpenNewGoal,
}) => {
  const displayGoals = React.useMemo(() => {
    if (goals && goals.length > 0) return goals;
    return [
      {
        id: "goal-1",
        userId: "demo",
        name: "Emergency Fund",
        type: "emergency_fund",
        currentAmount: 240000,
        targetAmount: 300000,
        targetDate: "2026-12-31",
        status: "active",
        icon: "🛡️",
        color: "#10B981",
        percentage: 80,
        daysRemaining: 108,
        monthlyRequired: 15000,
        isOnTrack: true,
      },
      {
        id: "goal-2",
        userId: "demo",
        name: "New M3 Max Laptop",
        type: "purchase",
        currentAmount: 65000,
        targetAmount: 120000,
        targetDate: "2026-11-15",
        status: "active",
        icon: "💻",
        color: "#8B5CF6",
        percentage: 54,
        daysRemaining: 62,
        monthlyRequired: 27500,
        isOnTrack: true,
      },
      {
        id: "goal-3",
        userId: "demo",
        name: "Team Strategy Retreat",
        type: "vacation",
        currentAmount: 42000,
        targetAmount: 80000,
        targetDate: "2027-01-20",
        status: "active",
        icon: "✈️",
        color: "#3B82F6",
        percentage: 52,
        daysRemaining: 128,
        monthlyRequired: 9500,
        isOnTrack: true,
      },
    ];
  }, [goals]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">
            Financial Goals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Capital allocation targets and milestone pacing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/goals"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onOpenNewGoal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121828] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.06] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          return (
            <div
              key={goal.id}
              className="fin-card p-5 flex flex-col justify-between hover:border-white/10 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{goal.icon || "🎯"}</span>
                    <h3 className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                      {goal.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                    {pct}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 mb-1.5">
                  <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
                    {formatCurrency(goal.currentAmount, currency)}
                  </span>
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    / {formatCurrency(goal.targetAmount, currency)}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: goal.color || "#8B5CF6",
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </span>
                <span className="text-emerald-400 font-medium">On Track</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

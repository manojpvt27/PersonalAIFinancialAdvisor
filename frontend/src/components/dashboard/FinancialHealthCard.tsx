import React, { useState } from "react";
import { ArrowUpRight, ChevronRight, X, ShieldCheck, Sparkles } from "lucide-react";
import { HealthScore } from "../../lib/types";

interface FinancialHealthCardProps {
  healthScore: HealthScore | null;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  healthScore,
}) => {
  const [showModal, setShowModal] = useState(false);

  const score = healthScore?.score || 72;
  const grade = healthScore?.grade || "GOOD";
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  const defaultBreakdown = [
    { label: "Savings Rate", value: 92, detail: "Ahead of peer benchmarks" },
    { label: "Cash Buffer", value: 78, detail: "6.7 months operating runway" },
    { label: "Spending Control", value: 71, detail: "Low category budget variance" },
    { label: "Income Stability", value: 84, detail: "Reliable recurring revenue" },
    { label: "Goal Progress", value: 65, detail: "On pace for annual milestones" },
  ];

  return (
    <>
      <div className="fin-card p-5 lg:p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              Financial Health
            </h2>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3 h-3" />
              <span>↑ 6 pts</span>
            </div>
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="relative shrink-0">
              <svg width="76" height="76" viewBox="0 0 76 76" className="transform -rotate-90">
                <circle
                  cx="38"
                  cy="38"
                  r="32"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="5"
                />
                <circle
                  cx="38"
                  cy="38"
                  r="32"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="5.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s ease-out",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-100 font-[family-name:var(--font-outfit)] tabular-nums">
                  {score}
                </span>
                <span className="text-[9px] font-medium text-slate-400">/ 100</span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
                {grade}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Your overall financial position is strong and expanding.
              </p>
            </div>
          </div>

          {/* 5-Dimension Compact Progress List */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            {defaultBreakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-medium">{item.label}</span>
                  <span className="font-mono text-slate-200 text-[11px] font-bold tabular-nums">
                    {item.value}%
                  </span>
                </div>
                <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-200/90 transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor:
                        item.value >= 80 ? "#10B981" : item.value >= 70 ? "#8B5CF6" : "#F59E0B",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-4 pt-3 border-t border-white/[0.06] text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-between transition-colors w-full text-left"
        >
          <span>View breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Breakdown Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fin-fade"
          onClick={() => setShowModal(false)}
        >
          <div
            className="fin-card bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Financial Health Index Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">
                    Overall Score: {score}/100 ({grade})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 mb-5">
              {defaultBreakdown.map((item) => (
                <div key={item.label} className="space-y-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="font-mono text-slate-100 font-bold tabular-nums">
                      {item.value}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor:
                          item.value >= 80 ? "#10B981" : item.value >= 70 ? "#8B5CF6" : "#F59E0B",
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>

            {healthScore?.suggestions && healthScore.suggestions.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommendations</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {healthScore.suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

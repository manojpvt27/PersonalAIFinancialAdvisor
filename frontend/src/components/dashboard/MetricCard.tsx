import React from "react";
import { Sparkline } from "./Sparkline";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trendText: string;
  isPositiveTrend?: boolean;
  contextText: string;
  sparklineData?: number[];
  progressPercent?: number;
  type?: "standard" | "progress";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trendText,
  isPositiveTrend = true,
  contextText,
  sparklineData,
  progressPercent,
  type = "standard",
}) => {
  return (
    <div className="fin-card p-5 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              isPositiveTrend
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {isPositiveTrend ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{trendText}</span>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl lg:text-[28px] font-bold text-slate-100 tracking-tight tabular-nums font-[family-name:var(--font-outfit)]">
            {value}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 truncate max-w-[160px]" title={contextText}>
          {contextText}
        </span>

        {type === "progress" && typeof progressPercent === "number" ? (
          <div className="w-20">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        ) : (
          <Sparkline
            data={sparklineData || []}
            isPositive={isPositiveTrend}
            width={72}
            height={22}
          />
        )}
      </div>
    </div>
  );
};

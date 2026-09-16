import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";
import { CATEGORY_CONFIG, ExpenseCategory } from "../../lib/types";

interface SpendingBreakdownCardProps {
  categoryBreakdown: Record<string, number>;
  totalSpending: number;
  currency: SupportedCurrency;
}

const DONUT_COLORS = [
  "#8B5CF6", // Subscriptions / Tech
  "#6366F1", // Rent / Housing
  "#EC4899", // Shopping
  "#F59E0B", // Food & Dining
  "#3B82F6", // Transportation
  "#10B981", // Utilities / Other
  "#64748B",
];

export const SpendingBreakdownCard: React.FC<SpendingBreakdownCardProps> = ({
  categoryBreakdown,
  totalSpending,
  currency,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = React.useMemo(() => {
    const entries = Object.entries(categoryBreakdown || {});
    if (entries.length === 0) {
      return [
        { name: "Subscriptions", key: "subscriptions", value: 67950 },
        { name: "Rent", key: "rent", value: 19500 },
        { name: "Shopping", key: "shopping", value: 14400 },
        { name: "Food & Dining", key: "food", value: 9600 },
        { name: "Transportation", key: "transportation", value: 6300 },
      ];
    }
    return entries
      .map(([key, value]) => ({
        name: CATEGORY_CONFIG[key as ExpenseCategory]?.label || key,
        key: key,
        value: Math.round(Number(value) || 0),
      }))
      .sort((a, b) => b.value - a.value);
  }, [categoryBreakdown]);

  const total = React.useMemo(() => {
    if (totalSpending > 0) return totalSpending;
    return data.reduce((acc, d) => acc + d.value, 0);
  }, [totalSpending, data]);

  return (
    <div className="fin-card p-5 lg:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">
            Where your money goes
          </h2>
          <span className="text-xs font-mono font-bold text-slate-300 tabular-nums">
            {formatCurrency(total, currency)}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Monthly expenditure allocation by category
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="w-[140px] h-[140px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                      stroke="rgba(8, 11, 17, 0.8)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                Total
              </span>
              <span className="text-xs font-bold text-slate-100 font-mono tabular-nums">
                {formatCurrency(total, currency, true)}
              </span>
            </div>
          </div>

          {/* Category Rows */}
          <div className="flex-1 space-y-2 w-full">
            {data.slice(0, 5).map((item, idx) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between text-xs p-1 rounded-md transition-colors cursor-pointer ${
                    activeIndex === idx ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-300 font-medium truncate max-w-[110px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                      {pct}%
                    </span>
                    <span className="font-mono text-slate-100 font-semibold text-xs tabular-nums">
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Link
        href="/dashboard/expenses"
        className="mt-4 pt-3 border-t border-white/[0.06] text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-between transition-colors"
      >
        <span>View all spending</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

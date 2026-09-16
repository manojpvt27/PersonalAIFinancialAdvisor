import React, { useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";

interface CashFlowChartProps {
  data: any[];
  currency: SupportedCurrency;
  monthRange: number;
  onRangeChange: (range: number) => void;
}

function CashFlowTooltip({ active, payload, label, currency }: any) {
  if (active && payload && payload.length) {
    const incomeVal = payload.find((p: any) => p.dataKey === "income")?.value || 0;
    const expenseVal = payload.find((p: any) => p.dataKey === "total")?.value || 0;
    const netVal = incomeVal - expenseVal;

    return (
      <div className="bg-[#0B0F19] text-white p-3.5 rounded-xl shadow-2xl text-xs border border-white/10 backdrop-blur-md min-w-[190px]">
        <p className="font-semibold text-slate-300 mb-2 pb-1.5 border-b border-white/[0.08]">
          {label}
        </p>
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Income</span>
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {formatCurrency(incomeVal, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Expenses</span>
            </span>
            <span className="font-bold text-rose-400 tabular-nums">
              {formatCurrency(expenseVal, currency)}
            </span>
          </div>

          <div className="pt-1.5 mt-1.5 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Net Flow</span>
            <span
              className={`font-bold tabular-nums ${
                netVal >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {netVal >= 0 ? "+" : ""}
              {formatCurrency(netVal, currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  currency,
  monthRange,
  onRangeChange,
}) => {
  const [viewMode, setViewMode] = useState<"actual" | "forecast">("actual");

  // Transform data if forecast mode is active
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (viewMode === "actual") return data;

    // Append 3 forecasted future periods
    const lastItem = data[data.length - 1];
    const avgIncome = data.reduce((acc, d) => acc + (d.income || 0), 0) / data.length;
    const avgExpense = data.reduce((acc, d) => acc + (d.total || 0), 0) / data.length;

    const forecastData = [...data];
    for (let i = 1; i <= 3; i++) {
      forecastData.push({
        month: `Forecast +${i}M`,
        income: Math.round(avgIncome * (1 + i * 0.03)),
        total: Math.round(avgExpense * (1 + i * 0.01)),
        isForecast: true,
      });
    }
    return forecastData;
  }, [data, viewMode]);

  return (
    <div className="fin-card p-5 lg:p-6 flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">
            Cash Flow
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Actual income, spending and projected cash position
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Actual vs Forecast Toggle */}
          <div className="flex items-center bg-[#121828] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setViewMode("actual")}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                viewMode === "actual"
                  ? "bg-purple-600/90 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Actual
            </button>
            <button
              onClick={() => setViewMode("forecast")}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                viewMode === "forecast"
                  ? "bg-purple-600/90 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Forecast
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex items-center bg-[#121828] p-0.5 rounded-lg border border-white/[0.06]">
            {[3, 6, 12].map((range) => (
              <button
                key={range}
                onClick={() => onRangeChange(range)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                  monthRange === range
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range}M
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cfIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cfExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v, currency, true)}
            />
            <Tooltip content={<CashFlowTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#cfIncome)"
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Expenses"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#cfExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end gap-5 pt-3 mt-1 border-t border-white/[0.04] text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Income Stream</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Operational Expenses</span>
        </div>
        {viewMode === "forecast" && (
          <div className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>AI Projected Velocity</span>
          </div>
        )}
      </div>
    </div>
  );
};

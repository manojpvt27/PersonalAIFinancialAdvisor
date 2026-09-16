"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, SupportedCurrency, DEFAULT_CURRENCY } from "../../../lib/currency";
import { BillItem } from "../../../lib/types";
import {
  Calendar as CalendarIcon,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function BillsPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  const [bills, setBills] = useState<BillItem[]>([
    {
      id: "bill-1",
      name: "Corporate Platinum Card Settlement",
      category: "Credit Card",
      amount: 42850,
      dueDate: "Sep 18, 2026",
      status: "upcoming",
      autoPay: true,
      account: "HDFC Primary",
    },
    {
      id: "bill-2",
      name: "Office & Co-Working Hub Lease",
      category: "Rent",
      amount: 25000,
      dueDate: "Sep 20, 2026",
      status: "upcoming",
      autoPay: false,
      account: "HDFC Primary",
    },
    {
      id: "bill-3",
      name: "Index Fund Wealth SIP",
      category: "Investment",
      amount: 20000,
      dueDate: "Sep 25, 2026",
      status: "upcoming",
      autoPay: true,
      account: "ICICI Reserves",
    },
    {
      id: "bill-4",
      name: "Commercial Working Capital EMI",
      category: "Loan",
      amount: 14500,
      dueDate: "Sep 30, 2026",
      status: "upcoming",
      autoPay: true,
      account: "HDFC Primary",
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (saved) setCurrency(saved);
    const handleCurChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };
    window.addEventListener("finai:currency-change", handleCurChange);
    return () => window.removeEventListener("finai:currency-change", handleCurChange);
  }, []);

  const totalDue = useMemo(() => {
    return bills.reduce((acc, b) => acc + (b.status === "upcoming" ? b.amount : 0), 0);
  }, [bills]);

  const markPaid = (id: string) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, status: "paid" } : b)));
  };

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Chronological Outflow Schedule</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Bill Calendar & Obligations
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Forecasted obligations for credit card balances, commercial rent, SIP allocations, and loan EMIs.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
            Upcoming 14-Day Capital Required
          </span>
          <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(totalDue, currency)}
          </span>
        </div>
      </div>

      {/* ===================== SCHEDULE STREAM ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((b) => {
          const isPaid = b.status === "paid";
          return (
            <div
              key={b.id}
              className={`fin-card p-5 flex flex-col justify-between transition-all ${
                isPaid ? "opacity-60 bg-white/[0.01]" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {b.category} • Due {b.dueDate}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isPaid
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {isPaid ? "Settled" : "Scheduled"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{b.name}</h3>

                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                    {formatCurrency(b.amount, currency)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">From {b.account}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {b.autoPay ? "⚡ Auto-debit enabled" : "Manual settlement"}
                </span>
                {!isPaid && (
                  <button
                    onClick={() => markPaid(b.id)}
                    className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

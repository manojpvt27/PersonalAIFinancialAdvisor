import React, { useState } from "react";
import Link from "next/link";
import { Download, ArrowRight, Search, Filter } from "lucide-react";
import { Expense, ExpenseCategory } from "../../lib/types";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";
import { CATEGORY_ICON_MAP } from "../../app/dashboard/page";

interface TransactionLedgerTableProps {
  transactions: Expense[];
  currency: SupportedCurrency;
}

export const TransactionLedgerTable: React.FC<TransactionLedgerTableProps> = ({
  transactions,
  currency,
}) => {
  const [search, setSearch] = useState("");

  const displayTx = React.useMemo(() => {
    if (transactions && transactions.length > 0) return transactions;
    return [
      {
        id: "tx-1",
        userId: "demo",
        amount: 1675,
        category: "subscriptions" as ExpenseCategory,
        date: new Date().toISOString(),
        paymentMethod: "credit_card",
        description: "Adobe Creative Cloud",
        tags: ["software"],
        notes: "Design tooling",
        isRecurring: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tx-2",
        userId: "demo",
        amount: 4250,
        category: "shopping" as ExpenseCategory,
        date: new Date(Date.now() - 86400000).toISOString(),
        paymentMethod: "upi",
        description: "Amazon Workstation Mount",
        tags: ["gear"],
        notes: "Desk setup",
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tx-3",
        userId: "demo",
        amount: 8450,
        category: "subscriptions" as ExpenseCategory,
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        paymentMethod: "credit_card",
        description: "OpenAI API Inference Burn",
        tags: ["ai"],
        notes: "Production cluster",
        isRecurring: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tx-4",
        userId: "demo",
        amount: 6500,
        category: "rent" as ExpenseCategory,
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        paymentMethod: "net_banking",
        description: "WeWork Dedicated Hub",
        tags: ["office"],
        notes: "Co-working membership",
        isRecurring: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }, [transactions]);

  const filtered = React.useMemo(() => {
    return displayTx.filter(
      (t) =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [displayTx, search]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = "Date,Merchant,Category,PaymentMethod,Amount\n";
    const rows = filtered
      .map(
        (t) =>
          `"${new Date(t.date).toISOString().split("T")[0]}","${t.description.replace(/"/g, '""')}","${t.category}","${t.paymentMethod || "other"}","${t.amount}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finai_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fin-card p-5 lg:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous live financial transaction stream
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#121828] border border-white/[0.06] text-slate-200 placeholder:text-slate-500 outline-none w-36 sm:w-44 focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg bg-[#121828] border border-white/[0.06] hover:bg-white/[0.08] text-slate-300 transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase font-semibold text-slate-400">
                <th className="pb-2.5 pl-1">Merchant / Vendor</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5 text-right">Amount</th>
                <th className="pb-2.5 text-right pr-1">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.slice(0, 5).map((tx) => {
                const IconComponent = CATEGORY_ICON_MAP[tx.category] || Filter;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#121828] border border-white/[0.06] flex items-center justify-center text-slate-300 shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                          {tx.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-medium text-slate-400 capitalize">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-rose-400 tabular-nums">
                      -{formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="py-3 text-right pr-1">
                      <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Link
        href="/dashboard/expenses"
        className="mt-3 pt-3 border-t border-white/[0.06] text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-between transition-colors"
      >
        <span>View all transactions</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

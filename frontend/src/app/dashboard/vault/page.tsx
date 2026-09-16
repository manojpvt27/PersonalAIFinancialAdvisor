"use client";

import React, { useState } from "react";
import { VaultDocument } from "../../../lib/types";
import {
  FolderLock,
  FileText,
  Search,
  Upload,
  Sparkles,
  Download,
  Trash2,
  Tag,
  CheckCircle2,
} from "lucide-react";

export default function DocumentVaultPage() {
  const [search, setSearch] = useState("");

  const [documents, setDocuments] = useState<VaultDocument[]>([
    {
      id: "doc-1",
      title: "HDFC Primary Bank Statement (Aug 2026)",
      docType: "bank_statement",
      fileSize: "1.4 MB",
      uploadDate: "Sep 02, 2026",
      extractedMetadata: {
        "Closing Balance": "₹4,25,000",
        "Total Debits": "₹1,17,750",
        "Total Credits": "₹8,10,000",
      },
      tags: ["Banking", "Verified", "Audit Ready"],
    },
    {
      id: "doc-2",
      title: "Health Insurance Policy Term 2026-27",
      docType: "insurance_policy",
      fileSize: "2.8 MB",
      uploadDate: "Aug 15, 2026",
      extractedMetadata: {
        "Sum Insured": "₹25,00,000",
        "Renewal Expiry": "Aug 14, 2027",
        "Deductible": "₹0",
      },
      tags: ["Insurance", "Protection", "Tax 80D"],
    },
    {
      id: "doc-3",
      title: "Commercial Loan Sanction Agreement",
      docType: "loan_agreement",
      fileSize: "3.1 MB",
      uploadDate: "Jul 10, 2026",
      extractedMetadata: {
        "Principal": "₹2,50,000",
        "Interest Rate": "11.5% p.a.",
        "Monthly EMI": "₹14,500",
      },
      tags: ["Loan", "Liability", "HDFC"],
    },
    {
      id: "doc-4",
      title: "Income Tax Return (ITR-V) Assessment Year 2026",
      docType: "tax_return",
      fileSize: "840 KB",
      uploadDate: "Jul 28, 2026",
      extractedMetadata: {
        "Acknowledgement": "•••• 9182",
        "Total Tax Paid": "₹1,85,000",
        "Verification": "E-Verified",
      },
      tags: ["Tax", "Compliance", "ITR"],
    },
  ]);

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 font-[family-name:var(--font-inter)] text-slate-100 max-w-7xl mx-auto">
      {/* ===================== HERO ===================== */}
      <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Encrypted Financial Document Storage & Metadata Extraction</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)]">
            Document Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Secure vault with automated OCR and natural language intelligence for bank statements, tax returns, and agreements.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* ===================== AI DOCUMENT SEARCH ===================== */}
      <div className="fin-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Natural language document search (e.g. 'When does my insurance expire?', 'What is my loan rate?')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121828] border border-white/[0.06] text-slate-100 text-xs outline-none focus:border-purple-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* ===================== DOCUMENTS LIST ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="fin-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {doc.docType.replace("_", " ")} • {doc.fileSize}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Uploaded {doc.uploadDate}</span>
              </div>

              <div className="flex items-center gap-2.5 my-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-100 truncate">{doc.title}</h3>
              </div>

              {/* Extracted Metadata Grid */}
              <div className="mt-3 p-3 rounded-xl bg-[#121828] border border-white/[0.04] space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3" /> AI Extracted Metadata
                </span>
                {Object.entries(doc.extractedMetadata).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{k}:</span>
                    <span className="font-mono font-bold text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {doc.tags.map((t) => (
                  <span key={t} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                    {t}
                  </span>
                ))}
              </div>
              <button className="p-1 rounded-md text-slate-400 hover:text-purple-300 transition-colors" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

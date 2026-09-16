'use client';

import React from 'react';
import AuthBrandPanel from './AuthBrandPanel';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#080B11] text-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Left Brand Panel: Visible on Desktop (lg and up) */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[42%] shrink-0 sticky top-0 h-screen">
        <AuthBrandPanel />
      </div>

      {/* Right Form Area: Centered and responsive */}
      <div className="flex-1 flex flex-col justify-between min-h-screen p-6 sm:p-8 md:p-12 lg:p-16 relative">
        {/* Subtle Background Glow on Right */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

        {/* Mobile Header (Brand Mark) */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">FinAI Pro</span>
              <span className="block text-[9px] font-mono text-purple-400">AI FINANCIAL OS</span>
            </div>
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-4 relative z-10">
          {children}
        </div>

        {/* Security / Legal Footer */}
        <div className="w-full max-w-[440px] mx-auto text-center pt-8 text-xs text-slate-500 relative z-10">
          <p>
            Your financial data is protected with industry-standard 256-bit encryption.
          </p>
        </div>
      </div>
    </div>
  );
}

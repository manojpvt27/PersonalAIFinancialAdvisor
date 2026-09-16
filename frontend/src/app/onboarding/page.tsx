'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Briefcase, 
  Target, 
  PieChart, 
  Zap,
  Building,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

const OBJECTIVES = [
  { id: 'build_wealth', title: 'Build Long-Term Wealth', desc: 'Compound investments & expand net worth', icon: TrendingUp },
  { id: 'track_spending', title: 'Track Discretionary Spending', desc: 'Plug leaks and control category burn', icon: PieChart },
  { id: 'reach_goals', title: 'Reach Financial Milestones', desc: 'House, emergency fund, or retirement', icon: Target },
  { id: 'business_finances', title: 'Founder / Business Finances', desc: 'Manage revenue, burn rate, and runway', icon: Briefcase },
  { id: 'autopilot_rules', title: 'Autonomous Guardrails', desc: 'Prevent budget overshoots with AI policy', icon: Zap },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(['build_wealth', 'reach_goals']);
  const [monthlyIncome, setMonthlyIncome] = useState('810000');
  const [monthlyBurn, setMonthlyBurn] = useState('117750');
  const [targetGoal, setTargetGoal] = useState('Emergency Buffer (₹3,00,000)');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleObjective = (id: string) => {
    setSelectedObjectives(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    setIsGenerating(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1800);
  };

  return (
    <div className="min-h-screen w-full bg-[#080B11] text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-purple-900/15 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">FinAI Pro</span>
            <span className="block text-[9px] font-mono text-purple-400">ONBOARDING OS</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span>Step {step} of 4</span>
          <div className="flex gap-1 ml-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-4 h-1 rounded-full transition-all duration-300 ${
                  step >= s ? 'bg-purple-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center Step Content */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        {step === 1 && (
          <div className="space-y-6 animate-fin-fade">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Step 1 — Objectives</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What are you here to accomplish?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                FinAI customizes your dashboard KPIs, AI advisors, and telemetry models based on your focus.
              </p>
            </div>

            <div className="space-y-2.5">
              {OBJECTIVES.map((obj) => {
                const isSelected = selectedObjectives.includes(obj.id);
                const Icon = obj.icon;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => toggleObjective(obj.id)}
                    className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition duration-150 ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500/40 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-[#0E1422] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{obj.title}</div>
                        <div className="text-xs text-slate-400">{obj.desc}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fin-fade">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Step 2 — Financial Cash Flow</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Monthly Inflow & Outflow Baseline
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Helps your AI calculate initial savings velocity, net burn rate, and baseline runway.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Estimated Total Monthly Income / Inflow (₹)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full h-13 px-4 rounded-xl bg-[#0E1422] border border-white/10 text-base font-mono font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Typical Total Monthly Expenses / Burn (₹)
                </label>
                <input
                  type="number"
                  value={monthlyBurn}
                  onChange={(e) => setMonthlyBurn(e.target.value)}
                  className="w-full h-13 px-4 rounded-xl bg-[#0E1422] border border-white/10 text-base font-mono font-bold text-rose-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Monthly Savings Velocity:</span>
                <span className="text-sm font-bold font-mono text-purple-300">
                  {formatCurrency(Math.max(0, Number(monthlyIncome) - Number(monthlyBurn)))} / mo
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fin-fade">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Step 3 — Primary Goal</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What is your #1 financial priority right now?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                FinAI Autopilot will allocate surplus capital towards this milestone first.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                'Emergency Buffer (₹3,00,000 Liquid Sweep)',
                'First Home Downpayment (₹40,00,000 in 2028)',
                '12-Month Founder Runway (₹15,00,000)',
                'Early Retirement / FIRE Corpus (₹5,00,00,000 by 45)'
              ].map((goal, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTargetGoal(goal)}
                  className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition ${
                    targetGoal === goal
                      ? 'bg-purple-500/10 border-purple-500/40 text-white'
                      : 'bg-[#0E1422] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-medium">{goal}</span>
                  {targetGoal === goal && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fin-fade">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Step 4 — Risk Calibration</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Investment Risk Preference
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Calibrates AI asset allocation models and simulator return assumptions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'conservative', label: 'Conservative', desc: 'Focus on capital preservation & debt yield' },
                { id: 'moderate', label: 'Moderate Growth', desc: 'Balanced equity index & liquid reserves' },
                { id: 'aggressive', label: 'High Growth', desc: 'Tech equity, ETFs, & max compounding' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRiskTolerance(r.id as any)}
                  className={`p-4 rounded-xl text-left border flex flex-col justify-between transition ${
                    riskTolerance === r.id
                      ? 'bg-purple-500/15 border-purple-500/50 text-white'
                      : 'bg-[#0E1422] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white block">{r.label}</span>
                    <span className="text-xs text-slate-400 mt-1 block leading-relaxed">{r.desc}</span>
                  </div>
                  {riskTolerance === r.id && (
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase mt-3">Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06] mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Financial OS...</span>
                </>
              ) : (
                <>
                  <span>Launch FinAI Pro</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl w-full mx-auto text-center text-xs text-slate-500 pt-4">
        256-bit HSM encrypted telemetry initialization
      </div>
    </div>
  );
}

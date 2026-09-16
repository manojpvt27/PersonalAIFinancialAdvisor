'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Palette, 
  DollarSign, 
  Bot, 
  Bell, 
  Link as LinkIcon, 
  Layout, 
  Database, 
  ShieldCheck, 
  CreditCard, 
  FlaskConical, 
  Keyboard, 
  HelpCircle, 
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Lock,
  Smartphone,
  Globe,
  Sliders,
  Search,
  Check,
  Eye,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  getStoredThemeSettings, 
  saveThemeSettings, 
  THEME_PRESETS, 
  ACCENT_PALETTES, 
  ThemePreset, 
  AccentColor, 
  DensityMode,
  ThemeMode,
  DashboardLayoutMode
} from '@/lib/theme-store';
import { CURRENCIES, SupportedCurrency, formatCurrency } from '@/lib/currency';
import { resetAllFinancialData, setDemoModeActive, isDemoModeActive } from '@/lib/demo-store';

type SettingsSection = 
  | 'account'
  | 'appearance'
  | 'financial'
  | 'ai'
  | 'notifications'
  | 'connections'
  | 'dashboard'
  | 'data'
  | 'security'
  | 'billing'
  | 'labs'
  | 'shortcuts'
  | 'help'
  | 'danger';

const SECTIONS = [
  { id: 'account', label: 'Account & Profile', icon: User },
  { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
  { id: 'financial', label: 'Financial Preferences', icon: DollarSign },
  { id: 'ai', label: 'AI Preferences', icon: Bot },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'connections', label: 'Connections & Sync', icon: LinkIcon },
  { id: 'dashboard', label: 'Dashboard Customizer', icon: Layout },
  { id: 'data', label: 'Data & Privacy', icon: Database },
  { id: 'security', label: 'Security Center', icon: ShieldCheck },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  { id: 'labs', label: 'FinAI Labs', icon: FlaskConical, badge: 'BETA' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState(getStoredThemeSettings());

  // Financial Prefs
  const [currency, setCurrency] = useState<SupportedCurrency>('INR');
  const [numberFormat, setNumberFormat] = useState<'indian' | 'standard'>('indian');
  const [fiscalYear, setFiscalYear] = useState('Apr - Mar');

  // AI Settings
  const [aiFrequency, setAiFrequency] = useState<'minimal' | 'balanced' | 'proactive'>('balanced');
  const [aiDetail, setAiDetail] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'growth' | 'aggressive'>('growth');
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);

  // Danger Zone
  const [resetInput, setResetInput] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setThemeSettings(getStoredThemeSettings());
    const storedCur = localStorage.getItem('preferredCurrency') as SupportedCurrency;
    if (storedCur && CURRENCIES[storedCur]) setCurrency(storedCur);
  }, []);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleUpdateTheme = (update: any) => {
    const updated = saveThemeSettings(update);
    setThemeSettings(updated);
    triggerToast('Theme preferences saved and applied.');
  };

  const handleCurrencyChange = (newCur: SupportedCurrency) => {
    setCurrency(newCur);
    localStorage.setItem('preferredCurrency', newCur);
    window.dispatchEvent(new CustomEvent('finai:currency-change', { detail: { currency: newCur } }));
    triggerToast(`Default currency changed to ${newCur}.`);
  };

  const handleExportData = (type: 'json' | 'csv' | 'report') => {
    const data = {
      exportDate: new Date().toISOString(),
      platform: 'FinAI Pro OS',
      netWorth: 694050,
      currency: currency,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finai_financial_export_${type}_${Date.now()}.${type === 'csv' ? 'csv' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(`Financial data export (${type.toUpperCase()}) initiated.`);
  };

  const handlePerformDestructiveReset = () => {
    if (resetInput.trim() !== 'RESET') return;
    resetAllFinancialData();
    setShowResetConfirm(false);
    setResetInput('');
    triggerToast('Financial telemetry and demo data have been completely wiped.');
  };

  const filteredSections = SECTIONS.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono tracking-wider uppercase mb-1">
            <Sliders className="w-3.5 h-3.5" />
            FinAI System Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Settings & Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your financial OS preferences, design theme, autonomous AI behavior, and data security.
          </p>
        </div>

        {/* Global Save Toast */}
        {saveToast && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-fin-fade">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveToast}</span>
          </div>
        )}
      </div>

      {/* Main Settings Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Navigation (4 cols) */}
        <div className="lg:col-span-4 fin-card p-3 rounded-2xl border border-white/[0.08] bg-[#0E1422] space-y-2 sticky top-24">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as SettingsSection)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? sec.danger
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-purple-600/20 text-white border border-purple-500/40 shadow-sm'
                      : sec.danger
                        ? 'text-rose-400/80 hover:bg-rose-950/20 hover:text-rose-300'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{sec.label}</span>
                  </div>
                  {sec.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Settings Content Area (8 cols) */}
        <div className="lg:col-span-8 fin-card-elevated p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0E1422] space-y-8">
          {/* ===================== APPEARANCE & THEMES ===================== */}
          {activeSection === 'appearance' && (
            <div className="space-y-8 animate-fin-fade">
              <div>
                <h3 className="text-lg font-bold text-white">Appearance & Theme Engine</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize the visual styling, darkness presets, accent colors, and interface density of your financial OS.
                </p>
              </div>

              {/* Theme Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Visual Theme Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                    const isSelected = themeSettings.theme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleUpdateTheme({ theme: key as ThemePreset })}
                        className={`p-3.5 rounded-2xl border text-left transition duration-150 relative ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                            : 'border-white/10 bg-slate-900 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{preset.name}</span>
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ backgroundColor: preset.surface }} 
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{preset.desc}</p>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-purple-400">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Colors */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Primary Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(ACCENT_PALETTES).map(([key, acc]) => {
                    const isSelected = themeSettings.accent === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleUpdateTheme({ accent: key as AccentColor })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                          isSelected
                            ? 'border-white text-white bg-slate-800'
                            : 'border-white/10 text-slate-400 hover:text-white bg-slate-950/60'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.primary }} />
                        <span>{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface Density & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Interface Density</label>
                  <select
                    value={themeSettings.density}
                    onChange={(e) => handleUpdateTheme({ density: e.target.value as DensityMode })}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="compact">Compact (High data density)</option>
                    <option value="comfortable">Comfortable (Balanced)</option>
                    <option value="spacious">Spacious (Relaxed spacing)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Glassmorphism Effects</label>
                  <select
                    value={themeSettings.glassEffects ? 'enabled' : 'disabled'}
                    onChange={(e) => handleUpdateTheme({ glassEffects: e.target.value === 'enabled' })}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="enabled">Enabled (Backdrop blur)</option>
                    <option value="disabled">Disabled (Opaque performance)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===================== FINANCIAL PREFERENCES ===================== */}
          {activeSection === 'financial' && (
            <div className="space-y-6 animate-fin-fade">
              <div>
                <h3 className="text-lg font-bold text-white">Financial & Localization Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure your primary currency, numerical formats, and fiscal reporting calendar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value as SupportedCurrency)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Numbering Notation</label>
                  <select
                    value={numberFormat}
                    onChange={(e) => { setNumberFormat(e.target.value as any); triggerToast('Number format updated.'); }}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="indian">Indian Format (₹1,00,000 / Lakhs & Crores)</option>
                    <option value="standard">International Standard ($100,000 / Millions)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Fiscal Year Cycle</label>
                  <select
                    value={fiscalYear}
                    onChange={(e) => { setFiscalYear(e.target.value); triggerToast('Fiscal year set to ' + e.target.value); }}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="Apr - Mar">April 1 – March 31 (India FY)</option>
                    <option value="Jan - Dec">January 1 – December 31 (Calendar FY)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Live Sample Formatting</label>
                  <div className="h-11 px-4 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Sample Value:</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(694050, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== AI PREFERENCES ===================== */}
          {activeSection === 'ai' && (
            <div className="space-y-6 animate-fin-fade">
              <div>
                <h3 className="text-lg font-bold text-white">AI Copilot & Intelligence Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fine-tune autonomous reasoning depth, risk profiling, and decision engine frequency.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Strategic Risk Profile</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['conservative', 'moderate', 'growth', 'aggressive'].map((prof) => (
                      <button
                        key={prof}
                        onClick={() => { setRiskProfile(prof as any); triggerToast(`Risk profile set to ${prof}.`); }}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold capitalize transition ${
                          riskProfile === prof
                            ? 'bg-purple-600/20 border-purple-500 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {prof}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Recommendation Frequency</label>
                    <select
                      value={aiFrequency}
                      onChange={(e) => { setAiFrequency(e.target.value as any); triggerToast('AI frequency calibrated.'); }}
                      className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                    >
                      <option value="minimal">Minimal (High-severity warnings only)</option>
                      <option value="balanced">Balanced (Key anomalies & opportunities)</option>
                      <option value="proactive">Proactive (Continuous optimization hints)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Response Detail Depth</label>
                    <select
                      value={aiDetail}
                      onChange={(e) => { setAiDetail(e.target.value as any); triggerToast('Response depth set.'); }}
                      className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                    >
                      <option value="concise">Concise (Direct bullets & verdict)</option>
                      <option value="balanced">Balanced (Verdict + Numbers + Why)</option>
                      <option value="detailed">Detailed (Comprehensive scenario impact)</option>
                    </select>
                  </div>
                </div>

                {/* Autopilot Master Policy Toggle */}
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-4 pt-4">
                  <div>
                    <span className="text-xs font-bold text-white block">Financial Autopilot Mode</span>
                    <span className="text-[11px] text-slate-300 leading-tight block">
                      Enables policy-based rebalancing and automated sweeps (Requires manual authorization per transaction).
                    </span>
                  </div>
                  <button
                    onClick={() => { setAutopilotEnabled(!autopilotEnabled); triggerToast(`Autopilot ${!autopilotEnabled ? 'Activated' : 'Paused'}.`); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                      autopilotEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {autopilotEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== DATA & PRIVACY ===================== */}
          {activeSection === 'data' && (
            <div className="space-y-6 animate-fin-fade">
              <div>
                <h3 className="text-lg font-bold text-white">Data Management & Exports</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Export complete snapshots of your ledgers, accounts, and telemetry reports.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleExportData('csv')}
                  className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-purple-500/40 text-left transition group"
                >
                  <Download className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">Export CSV Ledger</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Excel & Sheets format</span>
                </button>

                <button
                  onClick={() => handleExportData('json')}
                  className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-purple-500/40 text-left transition group"
                >
                  <Download className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">Export Full JSON</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Machine-readable backup</span>
                </button>

                <button
                  onClick={() => handleExportData('report')}
                  className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-purple-500/40 text-left transition group"
                >
                  <Sparkles className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">CFO Executive Brief</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Synthesized PDF report</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== DANGER ZONE ===================== */}
          {activeSection === 'danger' && (
            <div className="space-y-6 animate-fin-fade">
              <div className="border-b border-rose-500/20 pb-4">
                <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Danger Zone & Telemetry Reset
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Destructive operations that wipe ledger history, remove accounts, or purge demo records.
                </p>
              </div>

              <div className="space-y-4">
                {/* Reset Financial Data Card */}
                <div className="p-5 rounded-2xl bg-rose-950/15 border border-rose-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Reset All Financial Telemetry</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Purges transactions, accounts, budgets, goals, and recurring subscriptions. Preserves user login.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 shrink-0 transition"
                    >
                      Reset Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset Verification Modal */}
              {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                  <div className="w-full max-w-md fin-card-elevated rounded-2xl border border-rose-500/40 bg-[#0E1422] shadow-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-rose-400">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="text-base font-bold text-white">Confirm Destructive Reset</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This action will permanently delete all financial records, accounts, and AI models. Type <strong className="text-rose-400 font-mono">RESET</strong> below to authorize.
                    </p>
                    <input
                      type="text"
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="Type RESET"
                      className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-rose-500/40 text-sm text-white font-mono placeholder:text-slate-600 outline-none"
                    />
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => { setShowResetConfirm(false); setResetInput(''); }}
                        className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={resetInput.trim() !== 'RESET'}
                        onClick={handlePerformDestructiveReset}
                        className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-30 rounded-xl shadow-lg transition"
                      >
                        Authorize Purge
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== OTHER SECTIONS FALLBACK ===================== */}
          {!['appearance', 'financial', 'ai', 'data', 'danger'].includes(activeSection) && (
            <div className="space-y-6 animate-fin-fade">
              <div>
                <h3 className="text-lg font-bold text-white capitalize">{activeSection.replace('-', ' ')} Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configuration policies and system connections are synchronized with your 256-bit secure vault.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Configured & Operational</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All active policies for {activeSection} are operating under default enterprise security standards. Changes made here will update live telemetry models immediately.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

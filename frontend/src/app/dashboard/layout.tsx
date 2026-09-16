"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { notificationAPI } from "../../lib/api";
import { CURRENCIES, SupportedCurrency, DEFAULT_CURRENCY } from "../../lib/currency";
import { seedSampleStartupData } from "../../lib/demo-data";
import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  ClipboardList,
  Target,
  Lightbulb,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  Sparkles,
  Search,
  X,
  CreditCard,
  Building2,
  Calendar,
  Sliders,
  Flame,
  PieChart,
  Percent,
  FileText,
  Zap,
  FolderLock,
  Layers,
  Activity,
  ArrowRight,
  Database,
  ChevronDown,
  Settings,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import CommandCenterModal from "@/components/dashboard/CommandCenterModal";
import KeyboardShortcutsModal from "@/components/dashboard/KeyboardShortcutsModal";
import { 
  applyThemeToDocument, 
  getStoredThemeSettings, 
  saveThemeSettings, 
  THEME_PRESETS, 
  ACCENT_PALETTES, 
  ThemePreset, 
  AccentColor, 
  ThemeSettings 
} from "@/lib/theme-store";

interface NavGroup {
  group: string;
  items: {
    href: string;
    icon: React.ComponentType<any>;
    label: string;
    shortcut?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Executive Dashboard", shortcut: "⌘1" },
      { href: "/dashboard/brief", icon: Activity, label: "Daily Financial Brief", shortcut: "⌘2" },
    ],
  },
  {
    group: "MONEY",
    items: [
      { href: "/dashboard/accounts", icon: Building2, label: "Accounts Command", shortcut: "⌘3" },
      { href: "/dashboard/transactions", icon: Receipt, label: "Transaction Intelligence" },
      { href: "/dashboard/income", icon: TrendingUp, label: "Income & Inflows" },
      { href: "/dashboard/expenses", icon: CreditCard, label: "Expenses & Outflows" },
      { href: "/dashboard/subscriptions", icon: Layers, label: "Subscription Audit" },
      { href: "/dashboard/bills", icon: Calendar, label: "Bill Calendar" },
    ],
  },
  {
    group: "PLANNING & SIMULATION",
    items: [
      { href: "/dashboard/budgets", icon: ClipboardList, label: "Budget Governance" },
      { href: "/dashboard/goals", icon: Target, label: "Strategic Goals" },
      { href: "/dashboard/simulator", icon: Sliders, label: "What-If Simulator" },
      { href: "/dashboard/runway", icon: Flame, label: "Runway & Stress Test" },
    ],
  },
  {
    group: "WEALTH & TAX",
    items: [
      { href: "/dashboard/investments", icon: PieChart, label: "Investment Intelligence" },
      { href: "/dashboard/debt", icon: Percent, label: "Credit & Debt Center" },
      { href: "/dashboard/tax", icon: FileText, label: "Tax Intelligence" },
      { href: "/dashboard/vault", icon: FolderLock, label: "Document Vault" },
    ],
  },
  {
    group: "INTELLIGENCE",
    items: [
      { href: "/dashboard/advisor", icon: Bot, label: "AI Decision Copilot", shortcut: "⌘7" },
      { href: "/dashboard/insights", icon: Lightbulb, label: "Telemetry & Anomalies" },
      { href: "/dashboard/autopilot", icon: Zap, label: "Financial Autopilot" },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { href: "/dashboard/settings", icon: Settings, label: "System Settings", shortcut: "⌘," },
    ],
  },
];

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  if (segments.length === 0) return ["Dashboard", "Executive Overview"];
  return ["Dashboard", ...segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1))];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  // Command Palette & Shortcuts
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(getStoredThemeSettings());

  useEffect(() => {
    loadUser();
    const stored = getStoredThemeSettings();
    setCurrentTheme(stored);
    applyThemeToDocument(stored);

    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setCurrentTheme(e.detail);
        applyThemeToDocument(e.detail);
      }
    };
    window.addEventListener("finai:theme-change", handleThemeChange);
    return () => window.removeEventListener("finai:theme-change", handleThemeChange);
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const savedCur = localStorage.getItem("preferredCurrency") as SupportedCurrency;
    if (savedCur && CURRENCIES[savedCur]) {
      setCurrency(savedCur);
    }
  }, []);

  const changeCurrency = (c: SupportedCurrency) => {
    setCurrency(c);
    localStorage.setItem("preferredCurrency", c);
    setCurrencyMenuOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("finai:currency-change", { detail: c }));
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationAPI.list(),
        notificationAPI.count(),
      ]);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data.slice(0, 5) : []);
      setUnreadCount(countRes.data?.count || countRes.data?.unreadCount || 0);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  // Keyboard Shortcuts (⌘K and ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "?" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setShortcutsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && !isNaN(Number(e.key))) {
        const idx = Number(e.key) - 1;
        const allItems = navGroups.flatMap((g) => g.items);
        if (idx >= 0 && idx < allItems.length) {
          e.preventDefault();
          router.push(allItems[idx].href);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const triggerSeedData = async () => {
    setSeeding(true);
    setToastMsg("Generating financial OS dataset...");
    const res = await seedSampleStartupData();
    setSeeding(false);
    if (res.success) {
      setToastMsg("✨ Financial OS dataset synced!");
      setTimeout(() => {
        setToastMsg(null);
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 1000);
    } else {
      setToastMsg("❌ Failed to populate data");
      setTimeout(() => setToastMsg(null), 2000);
    }
  };

  const breadcrumbs = getBreadcrumb(pathname);

  const allNavLinks = navGroups.flatMap((g) => g.items);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="text-center animate-fin-fade">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <p className="text-xs font-medium text-slate-400">Loading FinAI Pro OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#080B11] text-slate-100 antialiased selection:bg-purple-500/30">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-100 bg-[#0E1422] border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fin-fade">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ===================== COMMAND PALETTE (⌘K) & SHORTCUTS (?) ===================== */}
      <CommandCenterModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-all duration-200 bg-[#0B0F18] border-r border-white/[0.06] shrink-0 select-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: sidebarCollapsed ? "72px" : "254px",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 border-b border-white/[0.06] h-[64px] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold tracking-wider text-slate-100 uppercase font-[family-name:var(--font-outfit)] leading-none">
                FinAI Pro
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-purple-400 mt-0.5 uppercase">
                AI Financial OS
              </span>
            </div>
          )}
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 pb-1">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                    {group.group}
                  </p>
                </div>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-purple-600/15 text-purple-300 border border-purple-500/20"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                    } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.shortcut && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? "text-purple-300 bg-purple-500/20"
                            : "text-slate-600 group-hover:text-slate-400 bg-white/[0.03]"
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* AI Copilot Status Card */}
          {!sidebarCollapsed && (
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">AI Copilot</span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Autonomous financial telemetry active
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom User Area */}
        <div className="p-3 space-y-1.5 border-t border-white/[0.06] mt-auto shrink-0 bg-[#0B0F18]">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] ${
              sidebarCollapsed ? "justify-center p-1.5" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "D"}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-slate-200 leading-tight">
                  {user?.name || "Demo User"}
                </p>
                <p className="text-[10px] font-medium truncate text-slate-500 mt-0.5">
                  {user?.email || "demo@finai.com"}
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-colors ${
              sidebarCollapsed ? "justify-center px-0" : ""
            }`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
            {!sidebarCollapsed && <span>Collapse menu</span>}
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <main className="flex-1 min-w-0 flex flex-col bg-[#080B11]">
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 bg-[#080B11]/90 backdrop-blur-md border-b border-white/[0.06] h-[64px]">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-slate-600">/</span>}
                  <span
                    className={
                      i === breadcrumbs.length - 1
                        ? "text-slate-200 font-semibold"
                        : "text-slate-500"
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Right: Global Search, Currency, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0E1422] border border-white/[0.06] text-xs text-slate-400 hover:border-white/[0.14] transition-colors w-64 justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">Search transactions, insights, goals...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-400 shrink-0">
                ⌘K
              </kbd>
            </button>

            {/* Currency Selector */}
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1422] border border-white/[0.06] text-xs font-bold text-slate-200 hover:border-white/[0.14] transition-colors"
                title="Currency Selector"
              >
                <span>{CURRENCIES[currency].symbol}</span>
                <span className="hidden md:inline">{CURRENCIES[currency].code}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {currencyMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 rounded-xl bg-[#0E1422] border border-white/10 shadow-2xl z-60 p-1">
                  {(Object.keys(CURRENCIES) as SupportedCurrency[]).map((curCode) => (
                    <button
                      key={curCode}
                      onClick={() => changeCurrency(curCode)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        currency === curCode
                          ? "bg-purple-600/20 text-purple-300"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                      }`}
                    >
                      <span>{CURRENCIES[curCode].label}</span>
                      {currency === curCode && <span className="text-purple-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Theme Switcher */}
            <div className="relative" ref={themeRef}>
              <button
                type="button"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1422] border border-white/[0.06] text-xs font-medium text-slate-200 hover:border-white/[0.14] transition-colors cursor-pointer"
                title="Theme & Appearance"
              >
                {currentTheme.mode === "light" ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span className="hidden md:inline capitalize">{THEME_PRESETS[currentTheme.theme]?.name || "Theme"}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {themeMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-[#0E1422] border border-white/10 shadow-2xl z-60 p-3 space-y-3 animate-fin-fade">
                  {/* Mode Selector */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">Mode</span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => saveThemeSettings({ mode: "dark" })}
                        className={`p-1.5 rounded-md transition cursor-pointer ${currentTheme.mode !== "light" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                        title="Dark Mode"
                      >
                        <Moon className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveThemeSettings({ mode: "light" })}
                        className={`p-1.5 rounded-md transition cursor-pointer ${currentTheme.mode === "light" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                        title="Light Mode"
                      >
                        <Sun className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Preset Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">Preset</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(THEME_PRESETS).map(([k, p]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => saveThemeSettings({ theme: k as ThemePreset })}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                            currentTheme.theme === k
                              ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                              : "text-slate-300 hover:bg-white/[0.05] border border-transparent"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: p.surface }} />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Selector */}
                  <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">Accent</span>
                    <div className="flex items-center justify-between gap-1.5">
                      {Object.entries(ACCENT_PALETTES).map(([k, a]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => saveThemeSettings({ accent: k as AccentColor })}
                          title={a.label}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition border cursor-pointer ${
                            currentTheme.accent === k
                              ? "border-white ring-2 ring-white/20 scale-105"
                              : "border-transparent hover:border-white/30"
                          }`}
                          style={{ backgroundColor: a.primary }}
                        >
                          {currentTheme.accent === k && <span className="text-white text-[10px] font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-[#0E1422] border border-white/[0.06] hover:border-white/[0.14] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white bg-rose-500">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-[#0E1422] border border-white/10 shadow-2xl z-60 p-1 animate-fin-fade">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <span className="text-xs font-bold text-slate-200">Notifications</span>
                    <button
                      className="text-[10px] font-semibold text-purple-400 hover:underline"
                      onClick={async () => {
                        try {
                          await notificationAPI.markAllRead();
                          loadNotifications();
                        } catch {}
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04]">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-white/[0.02]">
                          <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        No unread notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold"
              >
                {user?.name?.charAt(0).toUpperCase() || "D"}
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-[#0E1422] border border-white/10 shadow-2xl z-60 p-1 animate-fin-fade">
                  <div className="p-3 border-b border-white/[0.06]">
                    <p className="text-xs font-bold text-slate-200 truncate">{user?.name || "Demo User"}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || "demo@finai.com"}</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={triggerSeedData}
                      disabled={seeding}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-purple-400 hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{seeding ? "Populating..." : "Seed Demo Data"}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

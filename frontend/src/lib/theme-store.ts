'use client';

export type ThemePreset = 'midnight' | 'aurora' | 'ocean' | 'emerald' | 'minimal' | 'sunset';
export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
export type DensityMode = 'compact' | 'comfortable' | 'spacious';
export type DashboardLayoutMode = 'default' | 'compact' | 'analytics';

export interface ThemeSettings {
  theme: ThemePreset;
  mode: ThemeMode;
  accent: AccentColor;
  density: DensityMode;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  glassEffects: boolean;
  dashboardLayout: DashboardLayoutMode;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  theme: 'midnight',
  mode: 'dark',
  accent: 'violet',
  density: 'comfortable',
  sidebarCollapsed: false,
  animationsEnabled: true,
  glassEffects: true,
  dashboardLayout: 'default',
};

export const ACCENT_PALETTES: Record<AccentColor, { primary: string; hover: string; subtle: string; label: string }> = {
  violet: {
    primary: '#8B5CF6',
    hover: '#7C3AED',
    subtle: 'rgba(139, 92, 246, 0.15)',
    label: 'FinAI Violet'
  },
  blue: {
    primary: '#3B82F6',
    hover: '#2563EB',
    subtle: 'rgba(59, 130, 246, 0.15)',
    label: 'Electric Blue'
  },
  emerald: {
    primary: '#10B981',
    hover: '#059669',
    subtle: 'rgba(16, 185, 129, 0.15)',
    label: 'Growth Emerald'
  },
  amber: {
    primary: '#F59E0B',
    hover: '#D97706',
    subtle: 'rgba(245, 158, 11, 0.15)',
    label: 'Prestige Amber'
  },
  rose: {
    primary: '#F43F5E',
    hover: '#E11D48',
    subtle: 'rgba(244, 63, 94, 0.15)',
    label: 'Vibrant Rose'
  }
};

export const THEME_PRESETS: Record<ThemePreset, { name: string; canvas: string; sidebar: string; surface: string; elevated: string; border: string; desc: string }> = {
  midnight: {
    name: 'Midnight',
    canvas: '#080B11',
    sidebar: '#0B0F18',
    surface: '#0E1422',
    elevated: '#141C30',
    border: 'rgba(255, 255, 255, 0.08)',
    desc: 'Deep navy fintech foundation with crisp micro-borders'
  },
  aurora: {
    name: 'Aurora',
    canvas: '#0A0814',
    sidebar: '#0F0B1C',
    surface: '#130E26',
    elevated: '#1D1538',
    border: 'rgba(168, 85, 247, 0.16)',
    desc: 'Deep cosmic violet ambiance with iridescent highlights'
  },
  ocean: {
    name: 'Ocean',
    canvas: '#060E18',
    sidebar: '#081422',
    surface: '#0B1B30',
    elevated: '#102644',
    border: 'rgba(56, 189, 248, 0.16)',
    desc: 'Cool abyssal cyan depth designed for analytical focus'
  },
  emerald: {
    name: 'Emerald',
    canvas: '#06110D',
    sidebar: '#081712',
    surface: '#0C211A',
    elevated: '#123026',
    border: 'rgba(52, 211, 153, 0.16)',
    desc: 'Rich botanical surfaces inspired by wealth accumulation'
  },
  minimal: {
    name: 'Minimal Dark',
    canvas: '#050505',
    sidebar: '#0B0B0B',
    surface: '#121212',
    elevated: '#1A1A1A',
    border: 'rgba(255, 255, 255, 0.10)',
    desc: 'Pure monochrome OLED darkness with high contrast'
  },
  sunset: {
    name: 'Sunset',
    canvas: '#12080C',
    sidebar: '#180B11',
    surface: '#200E17',
    elevated: '#2D1421',
    border: 'rgba(251, 113, 133, 0.16)',
    desc: 'Warm ruby & copper undertones for executive reviews'
  }
};

export function getStoredThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME_SETTINGS;
  try {
    const raw = localStorage.getItem('finai:theme-settings');
    if (raw) return { ...DEFAULT_THEME_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load theme settings:', e);
  }
  return DEFAULT_THEME_SETTINGS;
}

export function saveThemeSettings(settings: Partial<ThemeSettings>): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME_SETTINGS;
  const current = getStoredThemeSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem('finai:theme-settings', JSON.stringify(updated));
    applyThemeToDocument(updated);
    window.dispatchEvent(new CustomEvent('finai:theme-change', { detail: updated }));
  } catch (e) {
    console.error('Failed to save theme settings:', e);
  }
  return updated;
}

export function applyThemeToDocument(settings: ThemeSettings) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;

  const isLight = settings.mode === 'light' || (
    settings.mode === 'system' && 
    typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: light)').matches
  );

  const preset = THEME_PRESETS[settings.theme] || THEME_PRESETS.midnight;
  const accent = ACCENT_PALETTES[settings.accent] || ACCENT_PALETTES.violet;

  if (isLight) {
    root.style.setProperty('--bg-canvas', '#F8FAFC');
    root.style.setProperty('--bg-sidebar', '#FFFFFF');
    root.style.setProperty('--bg-surface', '#FFFFFF');
    root.style.setProperty('--bg-surface-elevated', '#F1F5F9');
    root.style.setProperty('--bg-surface-subtle', '#F8FAFC');
    root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty('--border-hover', 'rgba(0, 0, 0, 0.16)');
    root.style.setProperty('--text-primary', '#0F172A');
    root.style.setProperty('--text-secondary', '#475569');
    root.style.setProperty('--text-muted', '#64748B');
    root.style.setProperty('--text-subtle', '#94A3B8');
  } else {
    root.style.setProperty('--bg-canvas', preset.canvas);
    root.style.setProperty('--bg-sidebar', preset.sidebar);
    root.style.setProperty('--bg-surface', preset.surface);
    root.style.setProperty('--bg-surface-elevated', preset.elevated);
    root.style.setProperty('--bg-surface-subtle', preset.surface);
    root.style.setProperty('--border-subtle', preset.border);
    root.style.setProperty('--border-hover', 'rgba(255, 255, 255, 0.18)');
    root.style.setProperty('--text-primary', '#F8FAFC');
    root.style.setProperty('--text-secondary', '#94A3B8');
    root.style.setProperty('--text-muted', '#64748B');
    root.style.setProperty('--text-subtle', '#475569');
  }

  root.style.setProperty('--brand-primary', accent.primary);
  root.style.setProperty('--brand-primary-hover', accent.hover);
  root.style.setProperty('--brand-primary-subtle', accent.subtle);

  root.setAttribute('data-theme', settings.theme);
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-accent', settings.accent);
  root.setAttribute('data-mode', isLight ? 'light' : 'dark');
}

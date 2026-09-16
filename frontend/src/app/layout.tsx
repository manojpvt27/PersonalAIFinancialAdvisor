import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinAI - Personal AI Financial Advisor",
  description: "Track expenses, manage budgets, analyze spending behavior, predict future expenses, and receive personalized AI-powered financial recommendations.",
  keywords: ["finance", "budget", "expense tracker", "AI advisor", "personal finance", "savings"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const raw = localStorage.getItem('finai:theme-settings');
                if (raw) {
                  const s = JSON.parse(raw);
                  const presets = {
                    midnight: { canvas: '#080B11', sidebar: '#0B0F18', surface: '#0E1422', elevated: '#141C30', border: 'rgba(255,255,255,0.08)' },
                    aurora: { canvas: '#0A0814', sidebar: '#0F0B1C', surface: '#130E26', elevated: '#1D1538', border: 'rgba(168,85,247,0.16)' },
                    ocean: { canvas: '#060E18', sidebar: '#081422', surface: '#0B1B30', elevated: '#102644', border: 'rgba(56,189,248,0.16)' },
                    emerald: { canvas: '#06110D', sidebar: '#081712', surface: '#0C211A', elevated: '#123026', border: 'rgba(52,211,153,0.16)' },
                    minimal: { canvas: '#050505', sidebar: '#0B0B0B', surface: '#121212', elevated: '#1A1A1A', border: 'rgba(255,255,255,0.10)' },
                    sunset: { canvas: '#12080C', sidebar: '#180B11', surface: '#200E17', elevated: '#2D1421', border: 'rgba(251,113,133,0.16)' }
                  };
                  const accents = {
                    violet: { primary: '#8B5CF6', hover: '#7C3AED', subtle: 'rgba(139,92,246,0.15)' },
                    blue: { primary: '#3B82F6', hover: '#2563EB', subtle: 'rgba(59,130,246,0.15)' },
                    emerald: { primary: '#10B981', hover: '#059669', subtle: 'rgba(16,185,129,0.15)' },
                    amber: { primary: '#F59E0B', hover: '#D97706', subtle: 'rgba(245,158,11,0.15)' },
                    rose: { primary: '#F43F5E', hover: '#E11D48', subtle: 'rgba(244,63,94,0.15)' }
                  };
                  const p = presets[s.theme] || presets.midnight;
                  const a = accents[s.accent] || accents.violet;
                  const r = document.documentElement;
                  const isLight = s.mode === 'light' || (s.mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
                  if (isLight) {
                    r.style.setProperty('--bg-canvas', '#F8FAFC');
                    r.style.setProperty('--bg-sidebar', '#FFFFFF');
                    r.style.setProperty('--bg-surface', '#FFFFFF');
                    r.style.setProperty('--bg-surface-elevated', '#F1F5F9');
                    r.style.setProperty('--border-subtle', 'rgba(0,0,0,0.08)');
                    r.style.setProperty('--text-primary', '#0F172A');
                    r.style.setProperty('--text-secondary', '#475569');
                  } else {
                    r.style.setProperty('--bg-canvas', p.canvas);
                    r.style.setProperty('--bg-sidebar', p.sidebar);
                    r.style.setProperty('--bg-surface', p.surface);
                    r.style.setProperty('--bg-surface-elevated', p.elevated);
                    r.style.setProperty('--border-subtle', p.border);
                    r.style.setProperty('--text-primary', '#F8FAFC');
                    r.style.setProperty('--text-secondary', '#94A3B8');
                  }
                  r.style.setProperty('--brand-primary', a.primary);
                  r.style.setProperty('--brand-primary-hover', a.hover);
                  r.style.setProperty('--brand-primary-subtle', a.subtle);
                  r.setAttribute('data-theme', s.theme || 'midnight');
                  r.setAttribute('data-accent', s.accent || 'violet');
                  r.setAttribute('data-density', s.density || 'comfortable');
                  r.setAttribute('data-mode', isLight ? 'light' : 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full font-[family-name:var(--font-inter)] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

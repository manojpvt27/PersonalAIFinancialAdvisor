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
      <body className="min-h-full font-[family-name:var(--font-inter)] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  label: string;
  rateFromINR: number; // For demo conversion
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", label: "INR (₹)", rateFromINR: 1 },
  USD: { code: "USD", symbol: "$", label: "USD ($)", rateFromINR: 0.012 },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€)", rateFromINR: 0.011 },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£)", rateFromINR: 0.0095 },
};

export const DEFAULT_CURRENCY: SupportedCurrency = "INR";

export function formatCurrency(
  amount: number | string | undefined | null,
  currencyCode: SupportedCurrency = "INR",
  compact: boolean = false
): string {
  const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = numericAmount * (config.rateFromINR || 1);

  if (compact && Math.abs(converted) >= 1000) {
    if (currencyCode === "INR") {
      if (Math.abs(converted) >= 10000000) {
        return `${config.symbol}${(converted / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(converted) >= 100000) {
        return `${config.symbol}${(converted / 100000).toFixed(2)} L`;
      }
      return `${config.symbol}${(converted / 1000).toFixed(1)}k`;
    } else {
      if (Math.abs(converted) >= 1000000) {
        return `${config.symbol}${(converted / 1000000).toFixed(2)}M`;
      }
      return `${config.symbol}${(converted / 1000).toFixed(1)}k`;
    }
  }

  return `${config.symbol}${Math.round(converted).toLocaleString(
    currencyCode === "INR" ? "en-IN" : "en-US"
  )}`;
}

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  INR: '₹ INR',
  USD: '$ USD',
  EUR: '€ EUR',
  GBP: '£ GBP',
  AED: 'د.إ AED',
  SGD: 'S$ SGD',
};

const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 84.0,
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.34,
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  convert: (usd: number) => number;
  format: (usd: number) => string;
  labels: Record<CurrencyCode, string>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const LOCALES: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AED: 'ar-AE',
  SGD: 'en-SG',
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);

  // Load saved currency from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gyftee_currency') as CurrencyCode | null;
    if (saved && saved in FALLBACK_RATES) setCurrencyState(saved);
  }, []);

  // Fetch live rates once on mount
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          setRates({
            INR: data.rates.INR ?? FALLBACK_RATES.INR,
            USD: 1,
            EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
            GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
            AED: data.rates.AED ?? FALLBACK_RATES.AED,
            SGD: data.rates.SGD ?? FALLBACK_RATES.SGD,
          });
        }
      })
      .catch(() => {}); // silently use fallback rates
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('gyftee_currency', c);
  };

  const convert = (usd: number) => Math.round(usd * rates[currency]);

  const format = (usd: number) =>
    new Intl.NumberFormat(LOCALES[currency], {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(convert(usd));

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, format, labels: CURRENCY_LABELS }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}

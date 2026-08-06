import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { BrandId } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { BRAND_META } from '@/data/brands';
import type { BrandMeta } from '@/data/brands';
import logoCivicEye from '@/assets/logo.svg';
import logoAmrita from '@/assets/logo-amrita.svg';

const STORAGE_KEY = 'civiceye:brand';

interface BrandContextValue {
  brand: BrandId;
  meta: BrandMeta;
  isAmrita: boolean;
}

const BrandContext = createContext<BrandContextValue | null>(null);

function initialBrand(): BrandId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'amrita' || stored === 'civiceye') return stored;
  } catch {
    /* ignore */
  }
  return 'civiceye';
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const { user, isAmrita, loading } = useAuth();
  const [brand, setBrand] = useState<BrandId>(initialBrand);

  /* Amrita emails → Amrita Eye. Everyone else (or logged out) → CivicEye. */
  useEffect(() => {
    if (loading) return;
    const next: BrandId = isAmrita && user ? 'amrita' : 'civiceye';
    setBrand(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAmrita, user?.id, loading]);

  /* Apply the brand class + document title + favicon. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('amrita', brand === 'amrita');
    document.title = BRAND_META[brand].appName;

    // Swap the browser-tab icon: indigo pin for CivicEye, red pin for Amrita Eye.
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', brand === 'amrita' ? logoAmrita : logoCivicEye);
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, brand);
    } catch {
      /* ignore */
    }
  }, [brand]);

  const value = useMemo<BrandContextValue>(
    () => ({ brand, meta: BRAND_META[brand], isAmrita: brand === 'amrita' }),
    [brand],
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export { BrandContext };

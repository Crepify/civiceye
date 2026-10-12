import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Wifi, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';

const DISMISSED_KEY = 'civiceye:amrita-network-prompt-dismissed:v1';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function wasRecentlyDismissed() {
  try {
    const timestamp = Number(localStorage.getItem(DISMISSED_KEY));
    return Number.isFinite(timestamp) && Date.now() - timestamp < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Private browsing may deny storage; the prompt can show again next visit.
  }
}

/** Offers the campus-branded experience when the server identifies Amrita's network. */
export function AmritaNetworkPrompt() {
  const { isAmrita } = useBrand();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (isAmrita || wasRecentlyDismissed()) return undefined;
    let cancelled = false;
    void fetch('/api/network-context', { headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() as Promise<{ isAmritaNetwork?: boolean }> : null))
      .then((result) => {
        if (!cancelled && result?.isAmritaNetwork) setOpen(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isAmrita]);

  const dismiss = () => {
    rememberDismissal();
    setOpen(false);
  };

  const switchToAmrita = async () => {
    setSwitching(true);
    // A signed-in CivicEye user must choose an Amrita account instead of being
    // sent through a redirect loop by RequireAmrita.
    try {
      if (user && !isAmrita) await signOut();
    } finally {
      window.location.assign('/login?next=%2Famrita');
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-labelledby="amrita-network-title"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          className="fixed bottom-4 left-4 right-4 z-[86] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-[420px]"
        >
          <div className="relative rounded-3xl border border-[#A51636]/20 bg-white p-5 shadow-[0_20px_60px_rgba(76,5,25,0.24)] dark:border-white/10 dark:bg-[#1b0b11]">
            <button type="button" onClick={dismiss} aria-label="Close Amrita Eye suggestion" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A51636]/10 text-[#A51636]">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p id="amrita-network-title" className="text-base font-black text-slate-900 dark:text-white">You’re on the Amrita campus network</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Would you like to switch to Amrita Eye for campus reports, maps, and floor plans?</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => void switchToAmrita()} disabled={switching} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#A51636] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#8a1230] disabled:opacity-60">
                {switching ? 'Opening Amrita Eye…' : 'Switch to Amrita Eye'} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={dismiss} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Stay on CivicEye</button>
            </div>
            {!user ? <p className="mt-3 text-center text-[11px] text-slate-400">You’ll be asked to sign in with your Amrita email.</p> : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

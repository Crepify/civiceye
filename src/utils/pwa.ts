/**
 * Tiny PWA helpers: register the service worker and capture the
 * beforeinstallprompt event so we can show our own install UI later.
 */

type BeforeInstallPromptEvent = Event & {
  prompt?: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(ev: BeforeInstallPromptEvent | null) => void>();

export function onBeforeInstallPrompt(cb: (ev: BeforeInstallPromptEvent | null) => void) {
  listeners.add(cb);
  if (deferredPrompt) cb(deferredPrompt);
  return () => listeners.delete(cb);
}

export function consumeInstallPrompt() {
  const ev = deferredPrompt;
  deferredPrompt = null;
  listeners.forEach((l) => l(null));
  return ev;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l(e as BeforeInstallPromptEvent));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((l) => l(null));
    try { localStorage.setItem('civiceye:pwa-installed', '1'); } catch { /* noop */ }
  });
}

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // don't interfere with dev HMR
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

/** True if the page is running inside an installed PWA window. */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    ((window.navigator as unknown as { standalone?: boolean }).standalone === true)
  );
}

const DISMISS_KEY = 'civiceye:pwa-prompt-dismissed';
export function hasDismissedInstallPrompt(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}
export function markInstallPromptDismissed() {
  try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* noop */ }
}
export function isInstalled(): boolean {
  try { return localStorage.getItem('civiceye:pwa-installed') === '1'; } catch { return false; }
}

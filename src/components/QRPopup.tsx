import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Smartphone, X } from 'lucide-react';
import { Modal } from './Modal';
import { useTheme } from '@/hooks/useTheme';
import { createSyncSession, publishPhoto, subscribeToSession } from '@/services/syncService';
import type { SyncEvent } from '@/services/syncService';

interface QRPopupProps {
  open: boolean;
  onClose: () => void;
  onPhoto: (photo: string) => void;
}

/**
 * Desktop "scan & upload" flow.
 * Shows a QR code that, when opened on a phone, lands on the phone-capture
 * view (Report page's `?session=` mode). Photos are relayed back through
 * the sync service and handed to the parent via `onPhoto`.
 */
export function QRPopup({ open, onClose, onPhoto }: QRPopupProps) {
  const { theme } = useTheme();
  const [sessionId] = useState(() => createSyncSession());
  const [connected, setConnected] = useState(false);
  const [received, setReceived] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    // Public link a phone can open: this same app with the session id.
    const base = import.meta.env.VITE_APP_URL || window.location.origin;
    setUrl(`${base}/report?session=${sessionId}`);
  }, [open, sessionId]);

  useEffect(() => {
    if (!open) return;
    const unsubscribe = subscribeToSession(sessionId, (event: SyncEvent) => {
      setConnected(true);
      setReceived(true);
      // Deliver the photo after a beat so the success state is visible.
      window.setTimeout(() => {
        onPhoto(event.photo);
        onClose();
      }, 900);
    });
    return unsubscribe;
  }, [open, sessionId, onPhoto, onClose]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      // The toast is handled by the parent.
    } catch {
      /* clipboard unavailable */
    }
  }, [url]);

  /** Manual paste fallback for the phone, if the user is on the same machine. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal open={open} onClose={onClose} title="Scan & upload a photo" size="max-w-md">
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Open this link on your phone, take a photo, and it will appear here automatically.
        </p>

        <div className="rounded-3xl border border-white/60 bg-white p-5 shadow-glow dark:border-white/10 dark:bg-slate-800">
          <QRCodeSVG
            value={url}
            size={190}
            bgColor="transparent"
            fgColor={theme === 'dark' ? '#e2e8f0' : '#1e1b4b'}
            level="M"
          />
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
            <span className="min-w-0 flex-1 truncate">{url}</span>
            <button
              onClick={copyLink}
              className="shrink-0 font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Copy
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Or scan the QR code with any phone camera — it opens the same link.
          </p>
        </div>

        <div className="flex min-h-12 w-full items-center justify-center">
          {received ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-5 w-5" />
              Photo received! Continuing…
            </motion.div>
          ) : connected ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              <Smartphone className="h-4 w-4" />
              Phone connected — waiting for photo…
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for your phone…
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-primary-600 hover:underline dark:hover:text-primary-400"
        >
          Testing on the same device? Pick a photo from your computer instead
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                // Simulate the phone → desktop round trip.
                publishPhoto(sessionId, reader.result);
              }
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </Modal>
  );
}

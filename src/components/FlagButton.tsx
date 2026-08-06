import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { flagService, FLAG_REASONS } from '@/services/flagService';
import type { FlagReason } from '@/services/flagService';
import { cn } from '@/utils/cn';

interface FlagButtonProps {
  reportId: string;
  className?: string;
}

/**
 * "Report" button next to the vote buttons on every post.
 * Opens a small modal where the user picks a reason (spam, harassment,
 * false info, inappropriate…) and adds a note; the flag is saved to
 * Supabase and shows up in the staff/admin panel.
 */
export function FlagButton({ reportId, className }: FlagButtonProps) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requireAuth = () => {
    if (user) return true;
    toast.info('Sign in required', 'Create a free account to report posts.');
    navigate('/login?next=' + encodeURIComponent(window.location.pathname));
    return false;
  };

  const submit = async () => {
    if (!requireAuth()) return;
    if (!reason) {
      toast.warning('Pick a reason', 'Please choose why you are reporting this post.');
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await flagService.add(reportId, reason, note.trim() || null, user.email ?? 'anonymous');
      toast.success('Thanks for reporting', 'Staff will review this post soon.');
      setOpen(false);
      setReason(null);
      setNote('');
    } catch (err) {
      toast.error('Could not report', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (requireAuth()) setOpen(true);
        }}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:border-rose-300 hover:text-rose-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:text-rose-400',
          className,
        )}
        title="Report this post to staff"
      >
        <Flag className="h-3.5 w-3.5" />
        Report
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Report this post" size="max-w-md">
        <div className="space-y-4 px-6 py-6">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Help keep the community safe. Choose a reason — staff will review this immediately.
          </p>

          <div className="space-y-2">
            {FLAG_REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setReason(r.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-all',
                  reason === r.id
                    ? 'border-rose-400 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 bg-white/60 text-slate-600 hover:border-rose-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border-2',
                    reason === r.id ? 'border-rose-500' : 'border-slate-300 dark:border-white/20',
                  )}
                >
                  {reason === r.id ? <span className="h-2 w-2 rounded-full bg-rose-500" /> : null}
                </span>
                {r.label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="flag-note" className="label-base">
              Add details (optional)
            </label>
            <textarea
              id="flag-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 300))}
              placeholder="Anything the staff should know?"
              className="input-base resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={() => void submit()} disabled={submitting} className="btn-danger !px-4 !py-2 text-xs">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              {submitting ? 'Submitting…' : 'Report post'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

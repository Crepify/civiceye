import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Send, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { displayName } from '@/services/reportService';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

const MAX_REVIEW_LENGTH = 600;

/**
 * Community review section for a report.
 * Signed-in users write reviews; anyone can see them; signed-in users
 * can agree/disagree with each review (one vote each, saved to Supabase).
 */
export function ReviewSection({ reportId }: { reportId: string }) {
  const { reviews, loading, mutating, myVotes, addReview, vote, remove } = useReviews(reportId);
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requireAuth = (): boolean => {
    if (user) return true;
    toast.info('Sign in required', 'Create a free account to review reports.');
    navigate('/login?next=' + encodeURIComponent(window.location.pathname));
    return false;
  };

  const submit = async () => {
    if (!requireAuth()) return;
    const text = content.trim();
    if (text.length < 2) {
      toast.warning('Review too short', 'Please write at least a couple of words.');
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await addReview(text, displayName(profile), user.id);
      setContent('');
      toast.success('Review posted!', 'Thanks for sharing your experience.');
    } catch (err) {
      toast.error('Could not post review', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = (reviewId: string, voteType: 'agree' | 'disagree') => {
    if (!requireAuth()) return;
    void vote(reviewId, voteType)
      .then(() => toast.success('Vote recorded'))
      .catch(() => toast.error('Could not record vote'));
  };

  return (
    <section className="card p-5 sm:p-6" aria-label="Reviews">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <MessageSquarePlus className="h-4.5 w-4.5 text-primary-500" />
            Reviews
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {reviews.length} review{reviews.length === 1 ? '' : 's'} · agree or disagree with each one
          </p>
        </div>
      </div>

      {/* Write a review */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
          rows={3}
          placeholder={
            user
              ? 'Was the report accurate? How was it resolved? Share your experience…'
              : 'Sign in to write a review'
          }
          disabled={!user || submitting}
          className="input-base resize-none disabled:opacity-60"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {content.length}/{MAX_REVIEW_LENGTH}
          </span>
          <button
            onClick={() => void submit()}
            disabled={!user || submitting || content.trim().length < 2}
            className="btn-primary !px-4 !py-2 text-xs"
          >
            {submitting ? 'Posting…' : (
              <>
                <Send className="h-3.5 w-3.5" />
                Post review
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reviews list */}
      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-slate-200/60 p-4 dark:border-white/10">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/80 py-10 text-center dark:border-white/10">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No reviews yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Be the first to share your experience with this report.
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const mine = myVotes[review.id];
            return (
              <motion.article
                key={review.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-amber-500 text-[11px] font-extrabold text-white">
                      {review.authorName
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || '?'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {review.authorName}
                      </p>
                      <p className="text-[11px] text-slate-400">{timeAgo(review.date)}</p>
                    </div>
                  </div>
                  {review.userId === user?.id ? (
                    <button
                      onClick={() =>
                        void remove(review.id).then(() => toast.info('Review deleted'))
                      }
                      disabled={mutating}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label="Delete your review"
                      title="Delete your review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {review.content}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleVote(review.id, 'agree')}
                    disabled={mutating}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
                      mine === 'agree'
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
                    )}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Agree · {review.agrees}
                  </button>
                  <button
                    onClick={() => handleVote(review.id, 'disagree')}
                    disabled={mutating}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
                      mine === 'disagree'
                        ? 'border-rose-400 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
                    )}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    Disagree · {review.disagrees}
                  </button>
                </div>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}

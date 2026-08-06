import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareQuote, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Review } from '@/types';
import { reviewService } from '@/services/reviewService';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { timeAgo } from '@/utils/format';

/**
 * Landing-page "Community reviews" — real reviews written by users,
 * pulled live from Supabase. Replaces the old static testimonials.
 */
export function CommunityReviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let mounted = true;
    reviewService
      .getRecent(6)
      .then((list) => {
        if (mounted) setReviews(list);
      })
      .catch(() => {
        if (mounted) setReviews([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="section-pad py-16 sm:py-24">
      <SectionHeading
        eyebrow="Community reviews"
        title="What users say about reported issues"
        description="Real reviews from citizens — every report page has its own review thread where neighbours agree or disagree."
      />

      {reviews === null ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton mt-3 h-3 w-full" />
              <div className="skeleton mt-2 h-3 w-4/5" />
              <div className="mt-4 flex gap-2">
                <div className="skeleton h-8 w-20" />
                <div className="skeleton h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300/80 py-14 text-center dark:border-white/10">
          <MessageSquareQuote className="mx-auto mb-3 h-9 w-9 text-slate-300 dark:text-slate-600" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">No reviews yet</p>
          <p className="mt-1.5 text-sm text-slate-400">
            Reviews appear here the moment the community starts writing them.
          </p>
          <Link to="/map" className="btn-secondary mt-6">
            Explore reports
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={(i % 3) * 0.1}>
              <figure className="card flex h-full flex-col p-6">
                <div className="mb-3 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <span>{review.authorName}</span>
                  <span className="font-medium normal-case">{timeAgo(review.date)}</span>
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  “{review.content}”
                </blockquote>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {review.agrees}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-600 dark:text-rose-400">
                      <ThumbsDown className="h-3.5 w-3.5" />
                      {review.disagrees}
                    </span>
                  </div>
                  {review.reportId ? (
                    <Link
                      to={`/report/${review.reportId}`}
                      className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                    >
                      View report →
                    </Link>
                  ) : null}
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { Review } from '@/types';
import { reviewService } from '@/services/reviewService';
import type { ReviewVote } from '@/services/reviewService';

/**
 * Loads + mutates reviews for a single report, and tracks which reviews
 * the current user has voted on.
 */
export function useReviews(reportId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [myVotes, setMyVotes] = useState<Record<string, ReviewVote>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await reviewService.getForReport(reportId);
      setReviews(list);
      const votes = await reviewService.getMyVotes(list.map((r) => r.id));
      setMyVotes(votes);
    } catch {
      // Keep whatever we had.
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addReview = useCallback(
    async (content: string, authorName: string, userId: string) => {
      setMutating(true);
      try {
        const created = await reviewService.create({
          reportId,
          content,
          authorName,
          userId,
        });
        await refresh();
        return created;
      } finally {
        setMutating(false);
      }
    },
    [reportId, refresh],
  );

  const vote = useCallback(
    async (reviewId: string, voteType: ReviewVote) => {
      setMutating(true);
      try {
        const updated = await reviewService.vote(reviewId, voteType);
        if (updated) await refresh();
        return updated;
      } finally {
        setMutating(false);
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (reviewId: string) => {
      setMutating(true);
      try {
        await reviewService.remove(reviewId);
        await refresh();
      } finally {
        setMutating(false);
      }
    },
    [refresh],
  );

  return { reviews, loading, mutating, myVotes, addReview, vote, remove };
}

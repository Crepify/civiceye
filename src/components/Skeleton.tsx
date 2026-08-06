import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  /** Render a full report-card shaped skeleton. */
  card?: boolean;
}

/** Shimmering placeholder block. */
export function Skeleton({ className, card = false }: SkeletonProps) {
  if (card) {
    return (
      <div className="card overflow-hidden">
        <div className="skeleton aspect-[16/9] rounded-none" />
        <div className="space-y-3 p-5">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-2/3" />
          <div className="flex gap-2 pt-1">
            <div className="skeleton h-6 w-16" />
            <div className="skeleton h-6 w-16" />
            <div className="skeleton h-6 w-16" />
          </div>
        </div>
      </div>
    );
  }
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

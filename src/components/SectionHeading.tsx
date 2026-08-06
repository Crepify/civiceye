import { cn } from '@/utils/cn';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Consistent heading block used across landing sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'mb-10 max-w-2xl sm:mb-14',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="heading-lg">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

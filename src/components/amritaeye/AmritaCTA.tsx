import { Link } from 'react-router-dom';

export function AmritaCTA() {
  return (
    <section className="border-t border-neutral-200 dark:border-neutral-800 bg-[#F5F5F7] dark:bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1920px] px-6 py-28 sm:py-36 text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold leading-[1.2] tracking-tight text-neutral-900 dark:text-white max-w-3xl">
          Ready to improve your campus?
        </h2>
        <p className="mt-6 max-w-2xl text-base font-normal leading-[1.5] text-neutral-600 dark:text-neutral-400">
          Join thousands of students and faculty reporting and resolving issues every day.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/report"
            className="inline-flex h-14 items-center justify-center rounded-full bg-[#A51636] px-10 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 dark:bg-[#E52B50]"
          >
            Report an issue
          </Link>
        </div>
      </div>
    </section>
  );
}

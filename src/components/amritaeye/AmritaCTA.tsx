import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
          <motion.div
            whileHover={{ y: -6, scale: 1.08, boxShadow: '0 25px 50px -12px rgba(165,22,54,0.5)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link
              to="/report"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#A51636] px-10 text-base font-semibold text-white relative overflow-hidden dark:bg-[#E52B50]"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                initial={{ x: '-120%' }}
                animate={{ x: '220%' }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                aria-hidden="true"
              />
              Report an issue
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

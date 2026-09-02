import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedText } from '@/components/ui/AnimatedText';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { type: 'spring', duration: 0.45, bounce: 0 }
  },
};

export function AmritaHero() {
  return (
    <section id="hero" aria-labelledby="amrita-hero-title" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-transparent">
      <motion.div 
        className="mx-auto max-w-[1920px] px-6 lg:px-12 flex flex-col items-center text-center z-10 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Eyebrow */}
        <motion.div variants={itemVariants} className="mb-8 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A51636] dark:text-[#E52B50]">
          <span className="h-2 w-2 rounded-full bg-[#A51636] dark:bg-[#E52B50]" aria-hidden="true" />
          <span>Amrita Eye · Campus Reporting</span>
        </motion.div>

        {/* Headline */}
        <h1
          id="amrita-hero-title"
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[72px] xl:text-[72px] font-bold leading-[1.08] tracking-[-0.03em] text-neutral-900 dark:text-white max-w-6xl mx-auto"
        >
          <span className="block">
            <AnimatedText text="Every" />{' '}
            <span className="font-serif italic font-normal text-[#A51636] dark:text-[#E52B50]">
              <AnimatedText text="broken" />
            </span>{' '}
            <AnimatedText text="light" />
          </span>
          <span className="block mt-2 sm:mt-4">
            <AnimatedText text="on campus" />{' '}
            <span className="font-serif italic font-normal text-[#A51636] dark:text-[#E52B50]">
              <AnimatedText text="has a witness." />
            </span>
          </span>
        </h1>

        <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-base font-normal leading-[1.5] text-neutral-600 dark:text-neutral-400">
          Photograph the issue, confirm its location, and send a traceable report directly to the campus team responsible for fixing it.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/report"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#A51636] px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 dark:bg-[#E52B50]"
          >
            Report an issue
          </Link>

          <Link
            to="/map"
            className="inline-flex h-14 items-center justify-center rounded-full border border-neutral-300 bg-white px-8 text-base font-semibold text-[#1D1D1F] transition-colors hover:bg-neutral-50 dark:bg-transparent dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-900"
          >
            View campus map
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

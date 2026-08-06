import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, MapPin } from 'lucide-react';

/** 404 page with a playful map-pin animation. */
export function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-3xl brand-grad-1 shadow-glow"
      >
        <Compass className="h-12 w-12 text-white" />
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.4, ease: 'easeInOut' }}
          className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-soft dark:bg-slate-800"
        >
          <MapPin className="h-5 w-5 text-rose-500" />
        </motion.span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400"
      >
        Error 404
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="heading-xl mt-3"
      >
        This street doesn\u2019t exist
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 max-w-md text-slate-500 dark:text-slate-400"
      >
        The page you\u2019re looking for was either moved, demolished, or never built. Let\u2019s
        get you back to somewhere safe.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
        <Link to="/map" className="btn-secondary">
          Explore the map
        </Link>
      </motion.div>
    </div>
  );
}

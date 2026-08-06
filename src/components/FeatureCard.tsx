import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { FeatureItem } from '@/data/features';

interface FeatureCardProps {
  feature: FeatureItem;
  index?: number;
}

/** Glass feature card with a hover-lift effect. */
export function FeatureCard({ feature, index = 0 }: FeatureCardProps) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group card relative overflow-hidden p-6 sm:p-7"
    >
      <div
        className={cn(
          'absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-20',
          feature.gradient,
        )}
      />
      <div
        className={cn(
          'mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
          feature.gradient,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {feature.description}
      </p>
    </motion.div>
  );
}

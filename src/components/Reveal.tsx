import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Base transition delay in seconds. */
  delay?: number;
  /** Direction the content enters from. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

const OFFSET = 28;
const DIRECTION_OFFSET = {
  up: { y: OFFSET, x: 0 },
  down: { y: -OFFSET, x: 0 },
  left: { x: OFFSET, y: 0 },
  right: { x: -OFFSET, y: 0 },
  none: { x: 0, y: 0 },
} as const;

/** Scroll-triggered reveal animation wrapper. */
export function Reveal({ children, delay = 0, direction = 'up', className }: RevealProps) {
  const offset = DIRECTION_OFFSET[direction];
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

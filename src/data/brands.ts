import type { BrandId } from '@/types';

export interface BrandMeta {
  id: BrandId;
  /** Prefix of the wordmark, e.g. "Civic" + "Eye". */
  wordmarkPrefix: string;
  tagline: string;
  appName: string;
  emoji: string;
  /** Meta description used for the browser tab + SEO. */
  description: string;
  /** theme-color for the address bar. */
  themeColor: string;
}

/** Brand identities for CivicEye (public) and Amrita Eye (campus). */
export const BRAND_META: Record<BrandId, BrandMeta> = {
  civiceye: {
    id: 'civiceye',
    wordmarkPrefix: 'Civic',
    tagline: 'Making cities better, one report at a time.',
    appName: 'CivicEye',
    emoji: '🏙️',
    description:
      'CivicEye — Making cities better, one report at a time. Report potholes, broken street lights, garbage dumps and more, then track them on a live community map.',
    themeColor: '#4f46e5',
  },
  amrita: {
    id: 'amrita',
    wordmarkPrefix: 'Amrita ',
    tagline: 'Keeping our campus safe, one report at a time.',
    appName: 'Amrita Eye',
    emoji: '🎓',
    description:
      'Amrita Eye — Keeping our campus safe, one report at a time. Report broken lights, garbage, hazards and more on campus, then track them on a live map.',
    themeColor: '#9e1b32',
  },
};

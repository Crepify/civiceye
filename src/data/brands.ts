import type { BrandId } from '@/types';

export interface BrandMeta {
  id: BrandId;
  /** Prefix of the wordmark, e.g. "Civic" + "Eye". */
  wordmarkPrefix: string;
  tagline: string;
  appName: string;
  emoji: string;
}

/** Brand identities for CivicEye (public) and Amrita Eye (campus). */
export const BRAND_META: Record<BrandId, BrandMeta> = {
  civiceye: {
    id: 'civiceye',
    wordmarkPrefix: 'Civic',
    tagline: 'Making cities better, one report at a time.',
    appName: 'CivicEye',
    emoji: '🏙️',
  },
  amrita: {
    id: 'amrita',
    wordmarkPrefix: 'Amrita ',
    tagline: 'Keeping our campus safe, one report at a time.',
    appName: 'Amrita Eye',
    emoji: '🎓',
  },
};

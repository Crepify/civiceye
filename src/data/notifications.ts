import type { AppNotification } from '@/types';

/**
 * Seed notifications shown in the bell.
 * Starts empty — new ones are generated at runtime when reports change
 * status (verify / resolve / new reports).
 */
export const SEED_NOTIFICATIONS: AppNotification[] = [];

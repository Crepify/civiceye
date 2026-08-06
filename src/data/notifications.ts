import type { AppNotification } from '@/types';

/**
 * Seed notifications shown in the bell. New ones are generated
 * at runtime when reports change status.
 */
export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    type: 'verify',
    title: 'Report verified',
    message:
      'Your report “Deep pothole near Sony signal” was confirmed by 3 neighbours and is now Verified.',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
  },
  {
    id: 'n-2',
    type: 'resolve',
    title: 'Issue resolved 🎉',
    message:
      'BBMP marked “Street light out on 9th Cross” as resolved. Thanks for helping your city!',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 'n-3',
    type: 'report',
    title: 'New reports near you',
    message:
      '3 new reports were added in Indiranagar over the weekend. See what your neighbours flagged.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: true,
  },
  {
    id: 'n-4',
    type: 'system',
    title: 'Welcome to CivicEye',
    message: 'Report your first issue or explore the live map to see what your ward looks like.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    read: true,
  },
];

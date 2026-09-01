import { Camera, MapPin, Radar, ShieldCheck, Trophy, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: Camera,
    title: 'Snap & Report',
    description:
      'Take a photo on your phone — even from a QR link — and our AI pre-fills the category, severity and description in seconds.',
    gradient: 'brand-grad-1',
  },
  {
    icon: MapPin,
    title: 'Live Community Map',
    description:
      'Every verified report appears on an interactive map with clustering, heatmaps, filters and one-tap navigation.',
    gradient: 'brand-grad-2',
  },
  {
    icon: Radar,
    title: 'AI Photo Analysis',
    description:
      'Computer vision detects objects, estimates severity and extracts GPS coordinates — so reporting takes seconds, not minutes.',
    gradient: 'brand-grad-3',
  },
  {
    icon: ShieldCheck,
    title: 'Community Validation',
    description:
      'Neighbours upvote, confirm or reject reports. Once enough people confirm, a report becomes Verified and rises in priority.',
    gradient: 'brand-grad-4',
  },
  {
    icon: Trophy,
    title: 'Authority Dashboard',
    description:
      'Ward officers get a live dashboard with charts, severity heatmaps, assignment tools and one-click official report generation.',
    gradient: 'brand-grad-5',
  },
  {
    icon: Users,
    title: 'Crowdsourced Power',
    description:
      '100 reports are stronger than 1. The community builds a shared picture of what needs fixing, ward by ward.',
    gradient: 'brand-grad-6',
  },
];

export const HOW_IT_WORKS: { step: number; title: string; description: string }[] = [
  {
    step: 1,
    title: 'Spot the problem',
    description:
      'Notice a pothole, a dark street or an open manhole? Open the app and pick a category.',
  },
  {
    step: 2,
    title: 'Snap a photo',
    description:
      'Capture evidence on your phone — our AI analyses it and fills in the details automatically.',
  },
  {
    step: 3,
    title: 'Pin the location',
    description: 'We grab GPS automatically, or you can drop a pin manually on the map.',
  },
  {
    step: 4,
    title: 'Community verifies',
    description:
      'Neighbours confirm your report. Verified reports surface on the map and in ward dashboards.',
  },
  {
    step: 5,
    title: 'Authority fixes it',
    description: 'Agencies assign, work and mark reports resolved. You get notified at every step.',
  },
];

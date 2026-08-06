import {
  CircleDot,
  CircleEllipsis,
  Droplets,
  Footprints,
  Lightbulb,
  Route,
  Siren,
  TrafficCone,
  Trash2,
  TreeDeciduous,
  Truck,
  Waves,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CategoryId } from '@/types';

/** Icons for every reportable category. */
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  pothole: CircleDot,
  'broken-road': Route,
  garbage: Trash2,
  sidewalk: Footprints,
  manhole: CircleEllipsis,
  'fallen-tree': TreeDeciduous,
  'street-light': Lightbulb,
  'water-leakage': Droplets,
  sewage: Waves,
  'illegal-dumping': Truck,
  'traffic-signal': TrafficCone,
  accident: Siren,
  other: Wrench,
};

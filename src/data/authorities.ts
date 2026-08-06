import type { Authority } from '@/types';

/**
 * Mock civic authorities used for dashboard assignment and
 * "Report to Authority" simulations.
 */
export const AUTHORITIES: Authority[] = [
  { id: 'bbmp-42', name: 'BBMP Ward 42', department: 'Roads & Infrastructure', color: '#f59e0b' },
  { id: 'bbmp-swm', name: 'BBMP Solid Waste Mgmt', department: 'Sanitation', color: '#22c55e' },
  { id: 'bwssb', name: 'BWSSB', department: 'Water Supply & Sewerage', color: '#38bdf8' },
  { id: 'bescom', name: 'BESCOM', department: 'Street Lighting & Power', color: '#facc15' },
  {
    id: 'traffic-police',
    name: 'Bengaluru Traffic Police',
    department: 'Traffic & Signals',
    color: '#fb7185',
  },
  { id: 'forest-dept', name: 'Forest Dept.', department: 'Trees & Parks', color: '#34d399' },
];

export const authorityById = (id: string | undefined): Authority | undefined =>
  AUTHORITIES.find((a) => a.id === id);

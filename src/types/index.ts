/**
 * Core domain types for CivicEye.
 * These model the civic-issue reporting domain end to end.
 */

/** Categories a citizen can report. */
export type CategoryId =
  | 'pothole'
  | 'broken-road'
  | 'garbage'
  | 'sidewalk'
  | 'manhole'
  | 'fallen-tree'
  | 'street-light'
  | 'water-leakage'
  | 'sewage'
  | 'illegal-dumping'
  | 'traffic-signal'
  | 'accident'
  | 'security'
  | 'other';

/** Perceived severity used by both citizens and authorities. */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

/** Lifecycle of a report. */
export type ReportStatus = 'pending' | 'verified' | 'in-progress' | 'resolved' | 'rejected';

/** A geographic point. */
export interface Coordinates {
  lat: number;
  lng: number;
}

/** A single civic issue report. */
export interface Report {
  id: string;
  /** Human friendly public code, e.g. "CE-1A2B3C4D". */
  code?: string;
  title: string;
  description: string;
  coordinates: Coordinates;
  /** Human friendly area label, e.g. "Indiranagar, Bengaluru". */
  locationName: string;
  category: CategoryId;
  severity: Severity;
  status: ReportStatus;
  /** Absolute URL, public path, or data-URL of the evidence photo. */
  image: string;
  upvotes: number;
  downvotes: number;
  /** Net votes = upvotes - downvotes. */
  votes: number;
  /** Number of neighbours who confirmed this report is real. */
  confirms: number;
  /** Number of neighbours who rejected this report. */
  rejects: number;
  /** ISO-8601 timestamp. */
  date: string;
  verified: boolean;
  /** Public display name of the citizen (or "Anonymous citizen"). */
  author: string;
  /** Authority agency currently handling it, when assigned. */
  assignedTo?: string;
  /** Owning auth user id (uuid), when logged in. */
  userId?: string;
}

/** A user profile (mirrors the `profiles` table). */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  /** True for any email ending in "amrita.edu" (any campus). */
  is_amrita: boolean;
  created_at: string;
}

/** Which branded product is active. */
export type BrandId = 'civiceye' | 'amrita';

/** Vote types supported by the `vote_on_report` RPC. */
export type VoteType = 'up' | 'down' | 'confirm' | 'reject';

/** A user-written review on a report, with agree/disagree tallies. */
export interface Review {
  id: string;
  reportId: string | null;
  userId: string | null;
  authorName: string;
  content: string;
  agrees: number;
  disagrees: number;
  date: string;
  /** Populated when reviews are fetched with their report (landing). */
  reportTitle?: string;
}

/** A report still being drafted inside the multi-step wizard. */
export interface ReportDraft {
  category: CategoryId;
  photo: string | null;
  analysis: AnalysisResult | null;
  coordinates: Coordinates | null;
  locationName: string;
  title: string;
  description: string;
}

/** Result of the (mocked) computer-vision photo analysis. */
export interface AnalysisResult {
  category: CategoryId;
  confidence: number;
  description: string;
  objects: string[];
  severity: Severity;
  coordinates: Coordinates | null;
  timestamp: string;
  /** Raw tags produced by the model. */
  tags: string[];
}

/** A toast notification shown by the ToastProvider. */
export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

/** A notification in the notification bell. */
export interface AppNotification {
  id: string;
  type: 'report' | 'verify' | 'resolve' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

/** A government / civic authority that reports can be assigned to. */
export interface Authority {
  id: string;
  name: string;
  department: string;
  color: string;
}

/** Chart-friendly aggregation bucket. */
export interface CategoryStat {
  category: CategoryId;
  count: number;
}

export interface SeverityStat {
  severity: Severity;
  count: number;
}

/** Filters used across the map and community feed. */
export interface ReportFilters {
  categories: CategoryId[];
  severities: Severity[];
  status: ReportStatus[];
  verifiedOnly: boolean;
  search: string;
}

export type SortKey = 'newest' | 'oldest' | 'votes' | 'confirms' | 'severity';

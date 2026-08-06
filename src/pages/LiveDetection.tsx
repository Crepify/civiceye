import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Camera,
  CircleDot,
  Construction,
  Eye,
  FastForward,
  Pause,
  Play,
  Radio,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Severity } from '@/types';
import { SEVERITY_META, categoryById } from '@/data/categories';
import { CATEGORY_ICONS } from '@/components/categoryIcons';
import { useToast } from '@/hooks/useToast';
import { LIVE_CAMERAS, detectFrame } from '@/services/detectionService';
import type { DetectionResult, LiveCamera } from '@/services/detectionService';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

interface FeedEvent extends DetectionResult {
  id: string;
  /** Report auto-created from this detection (if any). */
  reportId?: string;
}

const SPEEDS = [
  { label: '0.5×', ms: 1800 },
  { label: '1×', ms: 1100 },
  { label: '2×', ms: 550 },
];

const BOX_COLORS: Record<Severity, string> = {
  low: 'border-emerald-400 text-emerald-300',
  medium: 'border-amber-400 text-amber-300',
  high: 'border-orange-500 text-orange-300',
  critical: 'border-rose-500 text-rose-300',
};

/**
 * Live AI Detection — simulates a vision model watching CCTV feeds and
 * auto-creating CivicEye reports when it spots issues (potholes,
 * accidents, garbage, …). The real pipeline is documented in
 * LIVESTREAM_DETECTION.md; this page runs the identical event contract
 * against mock frames.
 */
export function LiveDetection() {
  const toast = useToast();

  const [camera, setCamera] = useState<LiveCamera>(LIVE_CAMERAS[0]);
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [threshold, setThreshold] = useState(0.7);
  const [autoReport, setAutoReport] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [current, setCurrent] = useState<DetectionResult | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [detections, setDetections] = useState(0);
  const [reportsCreated, setReportsCreated] = useState(0);
  const lastAuto = useRef<Record<string, number>>({});

  const intervalMs = SPEEDS[speedIdx].ms;

  /* ----- Advance the virtual stream ----- */
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setFrameIndex((f) => f + 1);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, intervalMs]);

  /* ----- Evaluate each frame ----- */
  useEffect(() => {
    if (frameIndex === 0 && !current) return;
    const result = detectFrame(camera, frameIndex);

    setCurrent(result);
    const event: FeedEvent = { ...result, id: `evt-${frameIndex}-${camera.id}` };

    let reportId: string | undefined;
    const wouldReport =
      autoReport &&
      result.category !== null &&
      result.confidence >= threshold &&
      (lastAuto.current[`${camera.id}:${result.category}`] ?? 0) < Date.now() - 15000;

    if (wouldReport && result.category) {
      // WORK IN PROGRESS: the real detector will create reports through
      // the API. For now we only preview the event locally.
      lastAuto.current[`${camera.id}:${result.category}`] = Date.now();
      setReportsCreated((c) => c + 1);
      toast.info(
        'Detection preview',
        `${categoryById(result.category).label} detected — auto-reporting is in progress.`,
      );
    }

    setFeed((prev) => [{ ...event, reportId }, ...prev].slice(0, 24));
    if (result.category) setDetections((d) => d + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameIndex]);

  const averageConfidence = useMemo(() => {
    if (feed.length === 0) return 0;
    const sum = feed.reduce((s, e) => s + e.confidence, 0);
    return Math.round((sum / feed.length) * 100);
  }, [feed]);

  return (
    <div className="pb-20 pt-[calc(var(--nav-height)+2.5rem)] sm:pt-[calc(var(--nav-height)+3.5rem)]">
      <div className="section-pad">
        {/* Work-in-progress banner */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <Construction className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            <strong>Work in progress.</strong> This page previews detections only — it does not
            create real reports yet. The production pipeline (real CCTV → YOLO model → verified
            events) is being rebuilt; see{' '}
            <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold">
              LIVESTREAM_DETECTION.md
            </code>{' '}
            for the plan.
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              <Radio className="h-4 w-4" />
              Live AI Detection
            </p>
            <h1 className="heading-xl mt-2">CCTV vision watchtower</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              A mock computer-vision model watches city camera feeds and previews potholes,
              accidents, garbage and more.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip !px-3 !py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
              {playing ? 'STREAMING' : 'PAUSED'}
            </span>
            <button
              onClick={() => setPlaying((p) => !p)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border transition-all',
                playing
                  ? 'border-rose-300 bg-rose-500/10 text-rose-600 dark:border-rose-500/40 dark:text-rose-400'
                  : 'border-emerald-300 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-400',
              )}
              aria-label={playing ? 'Pause stream' : 'Play stream'}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              icon: Activity,
              label: 'Frames analysed',
              value: frameIndex,
              gradient: 'from-primary-500 to-violet-600',
            },
            {
              icon: Eye,
              label: 'Issues detected',
              value: detections,
              gradient: 'from-amber-500 to-orange-600',
            },
            {
              icon: Zap,
              label: 'Auto-reports created',
              value: reportsCreated,
              gradient: 'from-emerald-500 to-teal-600',
            },
            {
              icon: Sparkles,
              label: 'Avg. confidence',
              value: `${averageConfidence}%`,
              gradient: 'from-sky-500 to-blue-600',
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex items-center gap-3 p-4"
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                  s.gradient,
                )}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Feed view */}
          <div className="card overflow-hidden">
            <div className="relative">
              {/* Camera frame */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                {current?.image ? (
                  <img
                    src={current.image}
                    alt="Live camera frame"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-600">
                    <Camera className="h-10 w-10" />
                    <p className="ml-2 text-sm font-semibold">No signal — scene clear</p>
                  </div>
                )}

                {/* CCTV overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40" />
                <div className="absolute inset-0 rounded-none ring-1 ring-inset ring-white/20" />

                {/* Corner brackets */}
                {[
                  'left-3 top-3 border-l-2 border-t-2',
                  'right-3 top-3 border-r-2 border-t-2',
                  'left-3 bottom-3 border-l-2 border-b-2',
                  'right-3 bottom-3 border-r-2 border-b-2',
                ].map((pos) => (
                  <span key={pos} className={cn('absolute h-6 w-6 border-white/60', pos)} />
                ))}

                {/* Top-left meta */}
                <div className="absolute left-6 top-5 text-white">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                    REC
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/90">{camera.streamLabel}</p>
                  <p className="text-[10px] text-white/60">{camera.name}</p>
                </div>

                {/* Top-right timestamp */}
                <div className="absolute right-6 top-5 text-right">
                  <p className="font-mono text-xs font-semibold text-white/90">
                    {new Date(current?.timestamp ?? Date.now()).toLocaleTimeString('en-IN', {
                      hour12: false,
                    })}
                  </p>
                  <p className="text-[10px] text-white/60">FRAME {frameIndex.toLocaleString()}</p>
                </div>

                {/* Scanline while playing */}
                <AnimatePresence>
                  {playing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan bg-gradient-to-b from-primary-400/20 to-transparent"
                    />
                  ) : null}
                </AnimatePresence>

                {/* Detection boxes */}
                {current?.boxes.map((box, i) => (
                  <motion.div
                    key={`${current.frameIndex}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'absolute rounded-md border-2 bg-slate-950/30 backdrop-blur-[1px]',
                      BOX_COLORS[current.severity],
                    )}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
                      {box.label} {Math.round(box.confidence * 100)}%
                    </span>
                  </motion.div>
                ))}

                {/* Bottom status */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                  {current?.category ? (
                    <span
                      className={cn(
                        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur',
                        SEVERITY_META[current.severity].bg,
                        SEVERITY_META[current.severity].color,
                      )}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {categoryById(current.category).label} ·{' '}
                      {Math.round(current.confidence * 100)}% confident
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur">
                      <CircleDot className="h-3.5 w-3.5" />
                      Scene clear
                    </span>
                  )}
                  <span className="rounded-full bg-slate-950/60 px-3 py-1.5 text-[10px] font-semibold text-white/80 backdrop-blur">
                    {camera.area}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <select
                  value={camera.id}
                  onChange={(e) =>
                    setCamera(LIVE_CAMERAS.find((c) => c.id === e.target.value) ?? LIVE_CAMERAS[0])
                  }
                  aria-label="Camera"
                  className="input-base w-auto !py-2 text-xs"
                >
                  {LIVE_CAMERAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      📷 {c.streamLabel} — {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/10">
                  {SPEEDS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSpeedIdx(i)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                        i === speedIdx
                          ? 'bg-white text-primary-600 shadow-softer dark:bg-slate-700 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Threshold
                  <input
                    type="range"
                    min={50}
                    max={95}
                    value={Math.round(threshold * 100)}
                    onChange={(e) => setThreshold(Number(e.target.value) / 100)}
                    className="w-24 accent-primary-600"
                    aria-label="Confidence threshold"
                  />
                  <span className="tabular-nums text-primary-600 dark:text-primary-400">
                    {Math.round(threshold * 100)}%
                  </span>
                </label>

                <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <button
                    role="switch"
                    aria-checked={autoReport}
                    onClick={() => setAutoReport((a) => !a)}
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      autoReport ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                        autoReport ? 'left-[18px]' : 'left-0.5',
                      )}
                    />
                  </button>
                  Auto-report
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 text-xs text-slate-400 dark:border-white/10">
              <FastForward className="mr-1 inline h-3.5 w-3.5" />
              Detections above the threshold are auto-created as <strong>pending</strong> reports —
              neighbours confirm them to make them Verified, exactly like manual reports.
            </div>
          </div>

          {/* Event feed */}
          <div className="card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Detection feed</p>
              <span className="chip !py-1">{feed.length} events</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: 520 }}>
              <AnimatePresence initial={false}>
                {feed.map((event) => {
                  const meta = event.category ? categoryById(event.category) : null;
                  const Icon = event.category ? CATEGORY_ICONS[event.category] : CircleDot;
                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'flex items-start gap-3 rounded-2xl border p-3',
                        event.category
                          ? 'border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]'
                          : 'border-slate-200/50 bg-slate-50/60 dark:border-white/5 dark:bg-white/[0.02]',
                      )}
                    >
                      {meta ? (
                        <span
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                            meta.gradient,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-400/15 text-slate-400">
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              'truncate text-sm font-bold',
                              event.category
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-400',
                            )}
                          >
                            {event.category ? categoryById(event.category).label : 'Scene clear'}
                          </p>
                          <span className="shrink-0 text-[10px] font-medium text-slate-400">
                            {timeAgo(event.timestamp)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {event.summary}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${event.confidence * 100}%` }}
                              className={cn(
                                'h-full rounded-full',
                                event.confidence >= 0.8
                                  ? 'bg-emerald-500'
                                  : event.confidence >= 0.6
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500',
                              )}
                            />
                          </div>
                          <span className="shrink-0 text-[10px] font-bold tabular-nums text-slate-500 dark:text-slate-400">
                            {Math.round(event.confidence * 100)}%
                          </span>
                        </div>
                        {event.reportId ? (
                          <Link
                            to={`/report/${event.reportId}`}
                            className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                          >
                            <Zap className="h-3 w-3" />
                            Auto-report {event.reportId}
                          </Link>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {feed.length === 0 ? (
                <div className="flex h-full items-center justify-center py-10 text-center text-sm text-slate-400">
                  Waiting for the first frame…
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

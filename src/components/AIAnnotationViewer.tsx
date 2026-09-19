import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Sparkles, Info, X } from 'lucide-react';
import type { Report } from '@/types';

interface AIAnnotationViewerProps {
  report: Report;
  compact?: boolean;
}

export function AIAnnotationViewer({ report, compact = false }: AIAnnotationViewerProps) {
  const [showAnnotated, setShowAnnotated] = useState(false);
  const [open, setOpen] = useState(false);
  
  const ai = (report as any).ai || {};
  const hasAnnotation = Boolean(ai.annotatedImage || ai.confidence || ai.objects?.length);
  
  if (!hasAnnotation) return null;

  const confidencePct = ai.confidence ? Math.round(ai.confidence * 100) : null;

  if (compact) {
    return (
      <div className="mt-3">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600 hover:bg-violet-500/20 dark:bg-violet-500/20 dark:text-violet-300"
        >
          <Eye className="h-3.5 w-3.5" /> AI {confidencePct ? `${confidencePct}%` : 'annotation'}
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#111]"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                  <X className="h-4 w-4" />
                </button>
                
                <div className="p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-violet-500" /> AI Annotation — {report.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{ai.description || report.description} · {confidencePct ? `${confidencePct}% confidence` : ''} · {ai.model || ai.engine || 'CivicEye AI'}</p>
                </div>

                <div className="grid gap-3 p-4 pt-0 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Original</p>
                    <img src={report.image} alt="Original" className="h-48 w-full rounded-xl object-cover" />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-600">AI Annotated {confidencePct ? `· ${confidencePct}%` : ''}</p>
                    {ai.annotatedImage ? (
                      <img src={ai.annotatedImage} alt="AI Annotated" className="h-48 w-full rounded-xl object-cover ring-2 ring-violet-500/30" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded-xl bg-violet-500/10 text-sm text-violet-600">
                        <Info className="mr-2 h-4 w-4" /> No annotated image — AI text only
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-2.5 py-1 font-medium dark:bg-white/10">Severity: {report.severity.toUpperCase()}</span>
                    {confidencePct ? <span className="rounded-full bg-violet-500 px-2.5 py-1 font-bold text-white">{confidencePct}% confidence</span> : null}
                    {ai.objects?.length ? <span className="rounded-full bg-white px-2.5 py-1 dark:bg-white/10">Objects: {ai.objects.join(', ')}</span> : null}
                    {ai.model ? <span className="rounded-full bg-white px-2.5 py-1 dark:bg-white/10">Model: {ai.model}</span> : null}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                    AI annotation includes attached picture with bounding boxes and severity, Google Maps coordinate link with severity, and link to report on website — same for Amrita Eye and CivicEye. View full report at {typeof window !== 'undefined' ? window.location.origin : ''}/report/{report.id}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
          <Sparkles className="h-4 w-4" /> AI Analysis {confidencePct ? `· ${confidencePct}%` : ''}
        </p>
        <div className="flex gap-1">
          <button onClick={() => setShowAnnotated(false)} className={`rounded-full px-3 py-1 text-xs font-bold ${!showAnnotated ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>Original</button>
          <button onClick={() => setShowAnnotated(true)} className={`rounded-full px-3 py-1 text-xs font-bold ${showAnnotated ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>AI Annotated</button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl">
        {showAnnotated && ai.annotatedImage ? (
          <img src={ai.annotatedImage} alt="AI Annotated" className="h-56 w-full object-cover" />
        ) : (
          <img src={report.image} alt="Original" className="h-56 w-full object-cover" />
        )}
      </div>

      <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p><b>AI:</b> {ai.description || report.description}</p>
        {ai.objects?.length ? <p><b>Objects:</b> {ai.objects.join(', ')}</p> : null}
        <p className="flex items-center gap-2">
          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-white font-bold">{report.severity.toUpperCase()}</span>
          {confidencePct ? <span className="rounded-full bg-white px-2 py-0.5 dark:bg-white/10">{confidencePct}% confidence</span> : null}
          {ai.model ? <span className="rounded-full bg-white px-2 py-0.5 dark:bg-white/10">{ai.model}</span> : null}
        </p>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Upload, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { uploadAnnotatedPhoto } from '@/lib/storage';
import { generateMockAnnotatedImage, generateAnnotatedFromPredictions } from '@/utils/image';
import { Badge } from '@/components/Badge';
import { PageHeader } from '@/components/PageHeader';
import { timeAgo } from '@/utils/format';

function imageUrlToDataUrl(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // If already data URL, return
      if (url.startsWith('data:')) return resolve(url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    } catch (e) {
      reject(e);
    }
  });
}

export function AdminBackfill() {
  const { reports, refresh } = useReports();
  const { user } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [bulkRunning, setBulkRunning] = useState(false);

  const oldReports = useMemo(() => {
    return reports.filter((r) => {
      const ai = r.ai as any;
      if (!ai) return true;
      if (!ai.annotatedImage) return true;
      if (ai.annotatedImage === r.image) return true;
      // If annotated is same as original URL (no boxes)
      return false;
    });
  }, [reports]);

  const generateForReport = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report || !user) return;
    setProcessing(reportId);
    try {
      const dataUrl = await imageUrlToDataUrl(report.image);
      const ai = report.ai as any;
      const category = report.category;
      const confidence = ai?.confidence || 0.85;
      const objects = ai?.objects || [category];
      const predictions = ai?.predictions || objects.map((o: string) => ({ class: o.split(' ')[0], confidence: 0.85 }));

      let annotated: string;
      if (predictions.length > 0 && predictions[0].x !== undefined) {
        try {
          annotated = await generateAnnotatedFromPredictions(dataUrl, predictions, category, confidence);
        } catch {
          annotated = await generateMockAnnotatedImage(dataUrl, category, confidence, objects);
        }
      } else {
        annotated = await generateMockAnnotatedImage(dataUrl, category, confidence, objects);
      }

      // Upload to storage
      let publicUrl = annotated;
      try {
        publicUrl = await uploadAnnotatedPhoto(annotated, user.id);
      } catch (e) {
        console.warn('Upload failed, using data URL', e);
      }

      // Update in Supabase
      if (supabase) {
        const { error } = await supabase
          .from('reports')
          .update({
            ai: {
              ...(ai || {}),
              annotatedImage: publicUrl,
              originalImage: ai?.originalImage || report.image,
              model: ai?.model || 'roboflow-detector',
              confidence: ai?.confidence || confidence,
              summary: ai?.summary || `AI detected ${category} with bounding boxes`,
              objects: ai?.objects || objects,
            }
          })
          .eq('id', reportId);
        if (error) throw error;
      }

      setResults((prev) => ({ ...prev, [reportId]: 'success' }));
      await refresh();
    } catch (err) {
      console.error(err);
      setResults((prev) => ({ ...prev, [reportId]: `failed: ${err instanceof Error ? err.message : 'unknown'}` }));
    } finally {
      setProcessing(null);
    }
  };

  const bulkBackfill = async () => {
    if (bulkRunning) return;
    setBulkRunning(true);
    for (const r of oldReports.slice(0, 20)) { // limit 20 per run to avoid rate limits
      await generateForReport(r.id);
      await new Promise((res) => setTimeout(res, 800)); // small delay
    }
    setBulkRunning(false);
  };

  return (
    <div className="pb-20 pt-[calc(var(--nav-height)+2.5rem)]">
      <PageHeader
        eyebrow="Admin"
        title="Backfill AI Annotations"
        description="Old reports without AI bounding boxes can be fixed here. Generates annotated images with boxes and saves to storage + database. New reports already get annotations automatically."
      />

      <div className="section-pad py-10">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold">
                <ScanLine className="h-5 w-5 text-[#A51636]" /> {oldReports.length} reports need annotation
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                These reports have no annotated image or annotated == original. Click Generate to create bounding boxes.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void refresh()} className="btn-ghost">
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
              <button 
                onClick={() => void bulkBackfill()} 
                disabled={bulkRunning || oldReports.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                {bulkRunning ? 'Running...' : `Bulk fix 20 oldest`}
              </button>
            </div>
          </div>

          {oldReports.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center dark:bg-emerald-500/10">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-3 font-bold text-emerald-800 dark:text-emerald-200">All reports have AI annotations! ✓</p>
              <p className="mt-1 text-sm text-emerald-700/70">New reports will automatically get annotated images with bounding boxes saved to storage.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {oldReports.slice(0, 30).map((report) => (
                <motion.div key={report.id} layout className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                  <div className="relative">
                    <img src={report.image} alt={report.title} className="aspect-[16/9] w-full object-cover" />
                    <div className="absolute left-2 top-2 flex gap-1">
                      <Badge className="bg-white/90 text-slate-700">{report.category}</Badge>
                      <Badge className="bg-amber-500/90 text-white">Needs AI</Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-[11px] text-white drop-shadow">
                      {report.id} · {timeAgo(report.date)}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-bold">{report.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{report.description}</p>
                    
                    {results[report.id] ? (
                      <div className={`mt-3 rounded-lg p-2 text-xs ${results[report.id] === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {results[report.id]}
                      </div>
                    ) : null}

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Original</div>
                        <img src={report.image} alt="Original" className="mt-1 h-20 w-full rounded-lg object-cover border" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">AI Annotated</div>
                        {report.ai?.annotatedImage && report.ai.annotatedImage !== report.image ? (
                          <img src={report.ai.annotatedImage} alt="Annotated" className="mt-1 h-20 w-full rounded-lg object-cover border border-emerald-300" />
                        ) : (
                          <div className="mt-1 flex h-20 w-full items-center justify-center rounded-lg border border-dashed bg-slate-50 text-[10px] text-slate-400">
                            No annotation yet
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => void generateForReport(report.id)}
                      disabled={processing === report.id || bulkRunning}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#A51636] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#8a1230] disabled:opacity-50"
                    >
                      {processing === report.id ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" /> Generate AI Annotation
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white dark:bg-[#0a0a0f]">
          <h4 className="flex items-center gap-2 text-sm font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> How it works
          </h4>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-300">
            <li>Fetches original image URL → converts to data URL</li>
            <li>Generates annotated image with bounding boxes using <code>generateAnnotatedFromPredictions</code> (real Roboflow boxes) or <code>generateMockAnnotatedImage</code> fallback</li>
            <li>Uploads annotated to Supabase Storage <code>report-photos/{`{userId}`}/annotated/</code> → public URL</li>
            <li>Updates <code>reports.ai.annotatedImage</code> in database — now shows different image with boxes in Community & Report Details</li>
            <li>New reports already do this automatically in ReportPage — old reports need this backfill</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

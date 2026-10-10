import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Inbox, RefreshCcw, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useBrand } from '@/hooks/useBrand';
import { useToast } from '@/hooks/useToast';

interface AuthorityResponse {
  id: string;
  report_id: string;
  sender_email: string;
  subject: string;
  body: string;
  validation_status: 'accepted' | 'needs_review' | 'rejected';
  validation_reason: string | null;
  received_at: string;
}

/** Admin checkpoint for provider-normalised authority replies. */
export function AuthorityResponseReview() {
  const { isAmrita } = useBrand();
  const toast = useToast();
  const [responses, setResponses] = useState<AuthorityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) {
      setAvailable(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('authority_responses')
      .select('id, report_id, sender_email, subject, body, validation_status, validation_reason, received_at, reports!inner(scope)')
      .eq('admin_review_status', 'pending')
      .eq('reports.scope', isAmrita ? 'campus' : 'city')
      .order('received_at', { ascending: false });
    if (error) {
      setAvailable(false);
      setResponses([]);
    } else {
      setAvailable(true);
      setResponses((data as AuthorityResponse[]) ?? []);
    }
    setLoading(false);
  }, [isAmrita]);

  useEffect(() => { void load(); }, [load]);

  const review = async (response: AuthorityResponse, approved: boolean) => {
    if (!supabase) return;
    setBusy(response.id);
    try {
      const { error } = await supabase.rpc('review_authority_response', {
        p_response_id: response.id,
        p_approved: approved,
      });
      if (error) throw error;

      toast.success(approved ? 'Resolution approved' : 'Reply rejected', approved ? 'The report is now resolved.' : 'The reply was rejected; the report status is unchanged.');
      await load();
    } catch (error) {
      toast.error('Could not review response', error instanceof Error ? error.message : 'Apply the authority response migration first.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><CheckCircle2 className="h-4.5 w-4.5 text-amber-500" /> Authority response review</h2>
          <p className="mt-1 text-xs text-slate-400">Verify the sender and fix evidence before approving a resolution.</p>
        </div>
        <button onClick={() => void load()} className="btn-ghost" title="Refresh authority responses"><RefreshCcw className="h-4 w-4" /></button>
      </div>
      {!available ? <div className="card p-4 text-xs text-slate-500">No response table is available yet. Apply `supabase/authority_responses.sql` to enable inbound authority review.</div> : null}
      {available && !loading && responses.length === 0 ? <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 py-10 text-center dark:border-white/10"><Inbox className="mb-3 h-7 w-7 text-slate-300" /><p className="text-sm font-bold text-slate-700 dark:text-slate-200">No authority replies awaiting review</p></div> : null}
      {responses.length ? <div className="space-y-3">{responses.map((response) => <article key={response.id} className="card overflow-hidden p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">{response.validation_status}</span><span className="text-[11px] text-slate-400">{response.report_id} · {new Date(response.received_at).toLocaleString('en-IN')}</span></div><h3 className="mt-2 font-bold text-slate-900 dark:text-white">{response.subject || 'Authority reply'}</h3><p className="mt-1 text-xs font-semibold text-slate-500">From {response.sender_email}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{response.body}</p><p className="mt-2 text-xs text-slate-400">{response.validation_reason}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => void review(response, true)} disabled={busy === response.id} className="btn-primary"><CheckCircle2 className="h-4 w-4" /> Approve</button><button onClick={() => void review(response, false)} disabled={busy === response.id} className="btn-secondary"><XCircle className="h-4 w-4" /> Reject</button></div></div></article>)}</div> : null}
    </section>
  );
}

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Lock, Send, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const LOCATIONS = [
  'Boys Hostel Mess',
  'Girls Hostel Mess',
  'Central Canteen',
  'Night Canteen',
  'Food Court / Other',
  'Drinking Water',
];

const ISSUES = [
  'Foreign object',
  'Undercooked or spoiled food',
  'Unclean serving area or utensils',
  'Allergen or veg / non-veg mix-up',
  'Unsafe drinking water',
  'Other food-safety concern',
];

export function AmritaFoodHygienePage() {
  const toast = useToast();
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [issueType, setIssueType] = useState(ISSUES[0]);
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [reference, setReference] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (description.trim().length < 3) return;
    setPhase('sending');
    try {
      const response = await fetch('/api/food-hygiene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({ location, issueType, severity, description: description.trim(), images: [] }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'The report could not be submitted.');
      setReference(result.ref || 'AMRITA-EYE');
      setPhase('done');
      toast.success('Submitted to campus food-safety staff', 'Keep this reference for follow-up.');
    } catch (error) {
      setPhase('error');
      toast.error('Submission failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] px-4 pb-20 pt-28 text-slate-900 dark:bg-[#1A030A] dark:text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="rounded-3xl border border-[#A51636]/15 bg-white p-6 shadow-[0_12px_40px_rgba(165,22,54,0.08)] dark:border-white/10 dark:bg-[#161618] sm:p-9">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A51636]/10 text-[#A51636]">
              <UtensilsCrossed className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A51636]">Amrita Eye · Campus service</p>
              <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Food safety and hygiene</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Report a concern in the mess or canteen so the campus food-safety team can investigate it. You must be signed in with your official Amrita account.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <TrustItem icon={Lock} text="Campus account required" />
            <TrustItem icon={ShieldCheck} text="Photos and details are handled securely" />
            <TrustItem icon={AlertTriangle} text="For emergencies call campus security / 112" />
          </div>
        </header>

        {phase === 'done' ? (
          <section className="mt-5 rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm dark:border-emerald-500/20 dark:bg-[#161618]">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <h2 className="mt-4 text-xl font-bold">Concern submitted</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Campus food-safety staff have received the report. Reference: <strong>{reference}</strong></p>
            <button onClick={() => { setPhase('idle'); setDescription(''); }} className="mt-6 rounded-full bg-[#A51636] px-5 py-3 text-sm font-bold text-white">Submit another concern</button>
          </section>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-5 rounded-3xl border border-[#A51636]/15 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#161618] sm:p-8">
            <Field label="Where did it happen?">
              <select value={location} onChange={(event) => setLocation(event.target.value)} className="input-base">{LOCATIONS.map((item) => <option key={item}>{item}</option>)}</select>
            </Field>
            <Field label="What happened?">
              <select value={issueType} onChange={(event) => setIssueType(event.target.value)} className="input-base">{ISSUES.map((item) => <option key={item}>{item}</option>)}</select>
            </Field>
            <Field label="How urgent is it?">
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'critical'].map((item) => <button type="button" key={item} onClick={() => setSeverity(item)} className={`rounded-xl border px-3 py-3 text-sm font-bold capitalize ${severity === item ? 'border-[#A51636] bg-[#A51636] text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'}`}>{item === 'critical' ? 'Health risk' : item}</button>)}
              </div>
            </Field>
            <Field label="What did you observe?">
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1800} rows={5} required placeholder="Briefly describe what happened, when, and what should be checked." className="input-base resize-none" />
            </Field>
            {phase === 'error' ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">We could not submit this concern. Check your connection and try again.</p> : null}
            <button type="submit" disabled={phase === 'sending' || description.trim().length < 3} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#A51636] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#84122b] disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" /> {phase === 'sending' ? 'Submitting securely…' : 'Submit food-safety concern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span>{children}</label>;
}

function TrustItem({ icon: Icon, text }: { icon: typeof Lock; text: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-[#FFF5F7] px-3 py-2 text-xs font-semibold text-[#6d3341] dark:bg-white/5 dark:text-slate-300"><Icon className="h-4 w-4 shrink-0 text-[#A51636]" />{text}</div>;
}

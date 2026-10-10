import { Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, Map, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { OFFICIAL_FLOOR_PLANS } from '@/data/amritaCampus/officialFloorPlans';

const VALUES = [
  ['Official plans', 'Find the room, floor, lift, stairs, and nearby facilities from the supplied campus plans.', Map],
  ['Student-first', 'Search faculty and rooms quickly when you are moving between classes or attending an event.', GraduationCap],
  ['Traceable action', 'Campus issues receive a reference, responsible team, status, and fix evidence.', CheckCircle2],
  ['Safer campus', 'Report maintenance, hygiene, and security concerns to the team that can act on them.', ShieldCheck],
] as const;

export function AmritaAbout() {
  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-20 pt-28 dark:bg-[#1A030A]">
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A51636]">About Amrita Eye</p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-[#6f1028] dark:text-white sm:text-6xl">Know your campus before you need it.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Amrita Eye is a campus workspace for wayfinding, room and faculty discovery, maintenance reporting, food-safety concerns, and visible follow-through.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link to="/amrita/map" className="rounded-full bg-[#A51636] px-5 py-3 text-sm font-bold text-white">Explore campus map</Link><Link to="/amrita/report" className="rounded-full border border-[#A51636]/25 bg-white px-5 py-3 text-sm font-bold text-[#A51636] dark:bg-white/5">Report a campus issue</Link></div>
          </div>
          <div className="rounded-3xl border border-[#A51636]/15 bg-white p-8 shadow-[0_18px_55px_rgba(165,22,54,0.1)] dark:border-white/10 dark:bg-[#161618]"><Logo iconOnly /><p className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">One campus view</p><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Blocks A–D, E Block Ground through Seventh Floor, faculty records, campus facilities, and issue routing live together.</p><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><Metric value="5" label="academic blocks" /><Metric value={String(OFFICIAL_FLOOR_PLANS.length)} label="official floor views" /><Metric value="155" label="faculty records" /><Metric value="1" label="campus workflow" /></div></div>
        </div>
      </section>
      <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8"><h2 className="font-serif text-3xl font-bold text-[#6f1028] dark:text-white">Built around the student journey</h2><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{VALUES.map(([title, text, Icon]) => <article key={title} className="rounded-2xl border border-[#A51636]/10 bg-white p-5 dark:border-white/10 dark:bg-[#161618]"><Icon className="h-6 w-6 text-[#A51636]" /><h3 className="mt-5 font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p></article>)}</div></section>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) { return <div className="rounded-xl bg-[#FFF5F7] p-3 dark:bg-white/5"><strong className="block text-xl text-[#A51636]">{value}</strong><span className="text-xs text-slate-500 dark:text-slate-400">{label}</span></div>; }

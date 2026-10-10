import { Link } from 'react-router-dom';
import { ArrowRight, Building2, FileSearch, Route, Search, ShieldCheck } from 'lucide-react';

const FEATURES = [
  ['Campus map', 'Search A–E blocks, gates, facilities, reports, and routes in one campus view.', Building2],
  ['Official floor plans', 'Open the supplied PDF-derived plans for every A–D floor and E Block Ground–Seventh Floor.', FileSearch],
  ['Room and faculty search', 'Find faculty, room numbers, departments, halls, labs, lifts, stairs, and washrooms.', Search],
  ['Campus routing', 'Get walking and indoor directions, with route data that administrators can verify and edit.', Route],
  ['Responsible reporting', 'Attach evidence, location, severity, and the correct campus team to every issue.', ShieldCheck],
];

export function AmritaFeatures() {
  return <div className="min-h-screen bg-[#FFF5F7] pb-20 pt-28 dark:bg-[#1A030A]"><div className="mx-auto max-w-6xl px-5 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A51636]">Amrita Eye</p><h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold tracking-tight text-[#6f1028] dark:text-white sm:text-6xl">A practical campus layer for every student.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">The pilot brings wayfinding, campus knowledge, and visible issue follow-through into a single Amrita-only experience.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([title, text, Icon]) => <article key={title as string} className="rounded-2xl border border-[#A51636]/10 bg-white p-6 dark:border-white/10 dark:bg-[#161618]"><Icon className="h-6 w-6 text-[#A51636]" /><h2 className="mt-6 font-bold text-slate-900 dark:text-white">{title as string}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text as string}</p></article>)}</div><Link to="/amrita/map" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#A51636] px-5 py-3 text-sm font-bold text-white">Open Campus Map <ArrowRight className="h-4 w-4" /></Link></div></div>;
}

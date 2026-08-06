import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { SectionHeading } from '@/components/SectionHeading';
import { FeatureCard } from '@/components/FeatureCard';
import { Reveal } from '@/components/Reveal';
import { StatCard } from '@/components/StatCard';
import { FEATURES, HOW_IT_WORKS } from '@/data/features';
import { TESTIMONIALS } from '@/data/testimonials';
import { CATEGORIES } from '@/data/categories';
import { FallbackMapView } from '@/components/map/FallbackMapView';
import { compactNumber } from '@/utils/format';

/** Landing page. */
export function Landing() {
  const { reports } = useReports();

  const stats = useMemo(() => {
    const verified = reports.filter((r) => r.verified).length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const critical = reports.filter((r) => r.severity === 'critical').length;
    const totalVotes = reports.reduce((s, r) => s + r.upvotes, 0);
    return { total: reports.length, verified, resolved, critical, totalVotes };
  }, [reports]);

  const showcase = useMemo(() => reports.slice(0, 40), [reports]);

  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 via-white to-white dark:from-primary-950/40 dark:via-slate-950 dark:to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(99,102,241,0.08),transparent_50%)]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(100,116,139,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.12) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, black, transparent)',
            }}
          />
          <motion.div
            animate={{ y: [0, -24, 0], x: [0, 16, 0] }}
            transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 28, 0], x: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
          />
        </div>

        <div className="section-pad">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-primary-500/10 px-4 py-1.5 text-xs font-bold text-primary-700 dark:border-primary-400/20 dark:bg-primary-400/10 dark:text-primary-300"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Prototype · live demo data
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="heading-xl mt-6"
              >
                Making cities better,
                <span className="text-gradient block">one report at a time.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg"
              >
                Spot a pothole, a dark street or an open manhole? Snap it, pin it, and let your
                neighbours + local authorities take it from there. Crowdsourced civic reporting,
                visualised live on a map.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link to="/report" className="btn-primary !px-7 !py-3.5 text-base">
                  Report an issue
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/map" className="btn-secondary !px-7 !py-3.5 text-base">
                  <Play className="h-4 w-4" />
                  Explore the map
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400 dark:text-slate-500"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Free for citizens
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ‍Verified by neighbours
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Shared with authorities
                </span>
              </motion.div>
            </div>

            {/* Hero visual: live map preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary-500/20 via-transparent to-emerald-500/20 blur-2xl" />
              <div className="card relative overflow-hidden !rounded-3xl p-2 shadow-glow">
                <div className="pointer-events-none relative h-[320px] overflow-hidden rounded-2xl sm:h-[400px]">
                  <FallbackMapView
                    reports={showcase}
                    center={{ lat: 12.97, lng: 77.6 }}
                    zoom={12}
                    onViewChange={() => undefined}
                    selectedId={null}
                    onSelect={() => undefined}
                    heatmap
                    pinDropping={false}
                    onPinDrop={() => undefined}
                    droppedPin={null}
                  />
                  {/* Decorative scanline */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-emerald-500 to-primary-500 opacity-60" />
                  <div className="absolute bottom-3 right-3 rounded-xl bg-white/85 px-3 py-1.5 text-[10px] font-bold text-slate-600 backdrop-blur dark:bg-slate-900/85 dark:text-slate-300">
                    LIVE · {compactNumber(stats.total)} reports
                  </div>
                </div>
              </div>

              {/* Floating chips */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                className="glass-strong absolute -left-3 top-10 hidden items-center gap-2 rounded-2xl px-4 py-2.5 shadow-glow sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {compactNumber(stats.verified)} verified
                  </p>
                  <p className="text-[10px] text-slate-400">by the community</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 0.6,
                }}
                className="glass-strong absolute -right-2 bottom-16 hidden items-center gap-2 rounded-2xl px-4 py-2.5 shadow-glow sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-400">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {compactNumber(stats.totalVotes)} votes cast
                  </p>
                  <p className="text-[10px] text-slate-400">across all reports</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Stats */}
      <section className="border-y border-slate-200/70 bg-white/70 py-12 backdrop-blur dark:border-white/5 dark:bg-white/[0.02] sm:py-16">
        <div className="section-pad">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={MapPin}
              label="Active reports"
              value={stats.total}
              sub="in the prototype database"
              gradient="from-primary-500 to-violet-600"
              index={0}
            />
            <StatCard
              icon={ShieldCheck}
              label="Verified reports"
              value={stats.verified}
              sub="confirmed by neighbours"
              gradient="from-emerald-500 to-teal-600"
              index={1}
            />
            <StatCard
              icon={CheckCircle2}
              label="Resolved"
              value={stats.resolved}
              sub="marked fixed by authorities"
              gradient="from-sky-500 to-blue-600"
              index={2}
            />
            <StatCard
              icon={Zap}
              label="Citizen votes"
              value={compactNumber(stats.totalVotes)}
              sub="community validation"
              gradient="from-amber-500 to-orange-600"
              index={3}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section className="section-pad py-16 sm:py-24">
        <SectionHeading
          eyebrow="How it works"
          title="Five steps from spotted to sorted"
          description="A reporting flow designed to take less than a minute — with AI and the community doing the heavy lifting."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div className="card relative h-full p-5 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-base font-extrabold text-white shadow-glow">
                  {step.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
                {i < HOW_IT_WORKS.length - 1 ? (
                  <ArrowRight className="absolute -right-3.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary-300 dark:text-primary-700 lg:block" />
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Features */}
      <section className="border-y border-slate-200/70 bg-white/60 py-16 dark:border-white/5 dark:bg-white/[0.02] sm:py-24">
        <div className="section-pad">
          <SectionHeading
            eyebrow="Features"
            title="A complete civic toolkit"
            description="From AI-powered photo analysis to authority dashboards — every piece a real product needs."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link to="/features" className="btn-secondary">
              Explore all features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ Category marquee */}
      <section className="overflow-hidden border-b border-slate-200/70 py-8 dark:border-white/5">
        <div className="pointer-events-none flex w-max animate-marquee gap-3">
          {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span key={`${c.id}-${i}`} className="chip shrink-0 !px-4 !py-2 text-sm">
              {c.label}
            </span>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Testimonials */}
      <section className="section-pad py-16 sm:py-24">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by the people who use it"
          description="Citizens, volunteers and agencies are already seeing streets change."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.1}>
              <figure className="card flex h-full flex-col p-6">
                <div className="mb-4 flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, s) => (
                    <svg key={s} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.2 3.68a1 1 0 0 0 .95.69h3.87c.97 0 1.37 1.24.59 1.81l-3.13 2.28a1 1 0 0 0-.36 1.12l1.2 3.68c.3.92-.76 1.68-1.54 1.11l-3.13-2.28a1 1 0 0 0-1.18 0l-3.13 2.28c-.78.57-1.84-.2-1.54-1.11l1.2-3.68a1 1 0 0 0-.36-1.12L2.4 9.11c-.78-.57-.38-1.81.6-1.81h3.86a1 1 0 0 0 .95-.69l1.24-3.68z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Map CTA */}
      <section className="section-pad pb-16 sm:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-600 p-10 shadow-glow sm:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-white/70">
                  Live map
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                  See the danger before you hit it
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                  Heatmaps, filters and severity pins help you pick safer routes — and show
                  authorities exactly where to send crews first.
                </p>
                <Link
                  to="/map"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-700 shadow-soft transition-all hover:-translate-y-0.5"
                >
                  <Navigation className="h-4 w-4" />
                  Open interactive map
                </Link>
              </div>
              <div className="hidden lg:block">
                <div className="card overflow-hidden !rounded-2xl p-1.5">
                  <div className="pointer-events-none h-64 overflow-hidden rounded-xl">
                    <FallbackMapView
                      reports={showcase.slice(0, 24)}
                      center={{ lat: 12.935, lng: 77.624 }}
                      zoom={13}
                      onViewChange={() => undefined}
                      selectedId={null}
                      onSelect={() => undefined}
                      heatmap
                      pinDropping={false}
                      onPinDrop={() => undefined}
                      droppedPin={null}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

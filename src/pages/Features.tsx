import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Map as MapIcon, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { FeatureCard } from '@/components/FeatureCard';
import { Reveal } from '@/components/Reveal';
import { FEATURES, HOW_IT_WORKS } from '@/data/features';

const DETAILS = [
  {
    icon: MapIcon,
    title: 'Interactive map, two engines',
    points: [
      'Full Google Maps integration when a key is configured',
      'Zero-config fallback vector map for instant demos',
      'Marker clustering, severity heatmap, live filters & search',
      'One-tap directions to any verified report',
    ],
  },
  {
    icon: Sparkles,
    title: 'AI photo analysis (mocked)',
    points: [
      'Category, confidence & severity auto-detected from the photo',
      'Detected objects and a human-readable AI description',
      'GPS extracted from the browser automatically',
      'Deterministic pipeline — the same photo gives the same result',
    ],
  },
  {
    icon: Users,
    title: 'Community validation',
    points: [
      'Upvote / downvote every report',
      'Confirm or reject based on local knowledge',
      'Auto-verification once enough neighbours confirm',
      'Verified reports surface on the map & dashboards',
    ],
  },
];

/** Features page. */
export function Features() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title="Everything you need to fix your street"
        description="CivicEye is a full product: a 60-second reporting flow, an AI assistant, a live map, community trust signals and a command centre for authorities."
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/report" className="btn-primary">
            Try reporting an issue
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/map" className="btn-secondary">
            Open the map
          </Link>
        </div>
      </PageHeader>

      {/* Feature grid */}
      <section className="section-pad py-16 sm:py-20">
        <SectionHeading
          eyebrow="Capabilities"
          title="Built like a real product, not a prototype"
          description="Every flow a citizen or a ward officer touches — designed, tested and polished."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* Detail blocks */}
      <section className="border-y border-slate-200/70 bg-white/60 py-16 dark:border-white/5 dark:bg-white/[0.02] sm:py-20">
        <div className="section-pad space-y-14">
          {DETAILS.map((d, i) => (
            <Reveal key={d.title} direction={i % 2 === 0 ? 'right' : 'left'}>
              <div
                className={`card grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-2 ${
                  i % 2 === 1 ? 'lg:[direction:rtl]' : ''
                }`}
              >
                <div className="lg:[direction:ltr]">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-soft">
                    <d.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {d.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {d.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:[direction:ltr]">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary-500/15 to-emerald-500/15 blur-xl" />
                    <img
                      src={
                        i === 0
                          ? '/reports/hero-city.jpg'
                          : i === 1
                            ? '/reports/pothole.jpg'
                            : '/reports/garbage.jpg'
                      }
                      alt={d.title}
                      loading="lazy"
                      className="relative aspect-[16/10] w-full rounded-2xl border border-white/60 object-cover shadow-soft dark:border-white/10"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad py-16 sm:py-20">
        <SectionHeading eyebrow="How it works" title="From broken street to fixed, in 5 steps" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div className="card relative h-full p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-sm font-extrabold text-white shadow-glow">
                  {step.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
                {i < HOW_IT_WORKS.length - 1 ? (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary-300 dark:text-primary-700 lg:block" />
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-pad pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-primary-600 p-10 text-center shadow-glow-emerald sm:p-14">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Ready to make your street safer?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/85 sm:text-base">
              The fastest way to understand CivicEye is to file a report. It takes less than a
              minute.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-700 shadow-soft transition-all hover:-translate-y-0.5"
              >
                Report an issue
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                View authority dashboard
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

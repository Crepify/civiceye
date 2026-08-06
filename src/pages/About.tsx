import { Link } from 'react-router-dom';
import { Heart, Lightbulb, MapPin, ShieldCheck, Target, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { Logo } from '@/components/Logo';

const VALUES = [
  {
    icon: Target,
    title: 'Citizens first',
    text: 'Every feature exists to make reporting faster, fairer and more transparent for the people who live with these problems daily.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified, not vague',
    text: 'Community confirmations turn anecdote into evidence. Authorities get organised, trustworthy data instead of scattered complaints.',
  },
  {
    icon: Users,
    title: 'Everyone is a sensor',
    text: 'A million phones are a million sensors. Together we see the city the way no single agency can.',
  },
  {
    icon: Lightbulb,
    title: 'Fix things, visibly',
    text: 'When a report goes from Pending → Verified → In progress → Resolved, everyone can see it. Progress becomes public.',
  },
];

const TIMELINE = [
  {
    year: '2025',
    title: 'The idea',
    text: 'A pothole on a commute becomes a 3-week headache. We started CivicEye to shorten that cycle.',
  },
  {
    year: '2026',
    title: 'The prototype',
    text: 'This hackathon build ships a full product experience — map, AI analysis, community validation and authority tools.',
  },
  {
    year: '2026+',
    title: 'The mission',
    text: 'Partner with ward offices, integrate with civic work orders, and scale city by city.',
  },
];

/** About page. */
export function About() {
  return (
    <>
      <PageHeader
        eyebrow="About CivicEye"
        title="Making cities better, one report at a time"
        description="CivicEye is a citizen-powered platform that turns everyday observations into organised, verifiable civic data — and hands it to the people who can fix it."
      />

      <section className="section-pad py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal direction="right">
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="From one pothole to a movement"
              className="mb-6"
            />
            <div className="space-y-4 text-slate-500 dark:text-slate-400">
              <p>
                Every city has the same story: a dangerous pothole, a dark street, an open manhole —
                reported over and over, with no single place keeping track. Complaints get lost in
                helplines, spread across apps, or simply forgotten.
              </p>
              <p>
                CivicEye fixes that by giving every citizen a one-minute reporting flow and giving
                every ward office one organised dashboard. Reports are validated by neighbours,
                prioritised by severity, and mapped live so everyone can see what\u2019s happening
                where.
              </p>
              <p>
                We believe that when citizens and authorities share the same picture of the city,
                things get fixed — faster, and more fairly.
              </p>
            </div>
          </Reveal>

          <Reveal direction="left" className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary-500/20 to-emerald-500/20 blur-2xl" />
              <div className="card relative max-w-md p-8 text-center">
                <div className="flex justify-center">
                  <Logo iconOnly />
                </div>
                <p className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">
                  100+ reports
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  in the prototype database
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {[
                    ['13', 'categories'],
                    ['24/7', 'reporting'],
                    ['100%', 'open data'],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
                      <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
                        {v}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/60 py-16 dark:border-white/5 dark:bg-white/[0.02] sm:py-20">
        <div className="section-pad">
          <SectionHeading eyebrow="What we believe" title="The values behind the product" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="card h-full p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad py-16 sm:py-20">
        <SectionHeading eyebrow="Timeline" title="Where we\u2019ve been, where we\u2019re going" />
        <div className="mx-auto max-w-3xl">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.1}>
              <div className="relative flex gap-6 pb-10 last:pb-0">
                {i < TIMELINE.length - 1 ? (
                  <span className="absolute left-[15px] top-9 h-full w-0.5 bg-gradient-to-b from-primary-400 to-emerald-400/40" />
                ) : null}
                <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 text-[10px] font-bold text-white shadow-glow">
                  {i + 1}
                </span>
                <div className="card flex-1 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                    {t.year}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-pad pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl brand-cta p-10 text-center shadow-glow sm:p-14">
            <MapPin className="mx-auto mb-4 h-10 w-10 text-white/80" />
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Spot something broken in your city?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
              It takes under a minute to file a report — and the community + authorities can act on
              it.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-700 shadow-soft transition-all hover:-translate-y-0.5"
              >
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                Report an issue
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                View the map
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

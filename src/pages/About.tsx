import { Link } from 'react-router-dom';
import { Compass, GraduationCap, Heart, Lightbulb, MapPin, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { Logo } from '@/components/Logo';

const VALUES = [
  {
    icon: GraduationCap,
    title: 'Born in the hostel',
    text: 'We were students new to a city we knew nothing about. CivicEye exists so the next fresher never has to learn a pothole the hard way.',
  },
  {
    icon: Compass,
    title: 'City knowledge, shared',
    text: 'Broken lights, dark streets, flooded junctions — the things locals know and newcomers don\u2019t. We make that knowledge visible to everyone.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified by neighbours',
    text: 'Reports are confirmed by the people who live there. Numbers and community votes decide what gets fixed first — no one decides alone.',
  },
  {
    icon: Lightbulb,
    title: 'Progress you can see',
    text: 'When a report goes Pending \u2192 Verified \u2192 In progress \u2192 Resolved, everyone can watch it. Fixing things visibly builds trust.',
  },
];

const TIMELINE = [
  {
    date: '1 August 2026',
    title: 'The idea is born',
    text: 'Living in hostels in a brand-new city, we realised no one tells you where the potholes are, which streets go dark at night, or which junctions flood after rain. You find out by getting hurt. We decided to fix that.',
  },
  {
    date: 'August 2026',
    title: 'The first build',
    text: 'The very first version of CivicEye — a shared map where anyone can report what\u2019s broken, dark, flooded or unsafe, and neighbours can verify it. Real logins, real reports, live on a map.',
  },
  {
    date: 'Ongoing',
    title: 'Campus & city rollout',
    text: 'Amrita Eye brings the same idea inside campuses — water leaks, broken lights, suspicious activity — straight to the people who keep the campus safe.',
  },
  {
    date: 'Next',
    title: 'The mission',
    text: 'Help anyone new to a place — students, freshers, new residents — and the people already living there, understand the neighbourhood before trouble finds them.',
  },
];

/** About page. */
export function About() {
  return (
    <>
      <PageHeader
        eyebrow="About CivicEye"
        title="Know your place before it bites"
        description="CivicEye is a shared, living map of what\u2019s broken, dark, flooded or unsafe in your city and campus — reported and verified by the people who live it, so newcomers and locals alike know where they\u2019re going."
      />

      <section className="section-pad py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal direction="right">
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="From a hostel room to a safer city"
              className="mb-6"
            />
            <div className="space-y-4 text-slate-500 dark:text-slate-400">
              <p>
                Every year, thousands of students move to a new city and spend four years there
                knowing almost nothing about it. Where are the potholes that swallow bike wheels?
                Which streets have no lights at night? Which junction floods every monsoon? The
                answers exist — scattered across the memory of people who've lived there a long
                time. Newcomers just don't have access to them.
              </p>
              <p>
                CivicEye started in the hostel as exactly that missing knowledge — a place where
                anyone can report what they see and neighbours can confirm it, so the whole map of
                "what to avoid" and "what to fix" is built together, one report at a time.
              </p>
              <p>
                It's for students and citizens who are new to a place, and for the people who live
                nearby — so a broken street light or a pothole costs you a scare instead of an
                accident, and a future headache turns into a fixed report.
              </p>
            </div>
          </Reveal>

          <Reveal direction="left" className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] brand-panel blur-2xl" />
              <div className="card relative max-w-md p-8 text-center">
                <div className="flex justify-center">
                  <Logo iconOnly />
                </div>
                <p className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">
                  Made by students, for students
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  and for anyone new to their neighbourhood
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {[
                    ['1 Aug', '2026'],
                    ['4 yrs', 'of college life'],
                    ['100%', 'community-built'],
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
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl brand-grad-1 text-white">
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
        <SectionHeading eyebrow="Timeline" title="How this started" />
        <div className="mx-auto max-w-3xl">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.date} delay={i * 0.1}>
              <div className="relative flex gap-6 pb-10 last:pb-0">
                {i < TIMELINE.length - 1 ? (
                  <span className="absolute left-[15px] top-9 h-full w-0.5 bg-gradient-to-b from-primary-400 to-accent-400/40" />
                ) : null}
                <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-grad-1 text-[10px] font-bold text-white shadow-glow">
                  {i + 1}
                </span>
                <div className="card flex-1 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                    {t.date}
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
              New to the neighbourhood?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
              See what the people around you already know — and add what you spot. It takes under a
              minute.
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

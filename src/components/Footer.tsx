import { Link } from 'react-router-dom';
import { Facebook, Github, Heart, Instagram, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import { Logo } from './Logo';
import { useBrand } from '@/hooks/useBrand';

const QUICK_LINKS = [
  { to: '/map', label: 'Interactive Map' },
  { to: '/live', label: 'Live AI Detection' },
  { to: '/report', label: 'Report an Issue' },
  { to: '/community', label: 'Community Reports' },
  { to: '/dashboard', label: 'Authorities Dashboard' },
  { to: '/features', label: 'Features' },
];

const COMPANY_LINKS = [
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact' },
  { to: '/features', label: 'How it works' },
];

const AMRITA_PLACE = 'Amrita Vishwa Vidyapeetham · Bengaluru Campus';

const SOCIALS = [
  { href: 'https://twitter.com', label: 'Twitter / X', icon: Twitter },
  { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://github.com', label: 'GitHub', icon: Github },
];

/** Site-wide footer. */
export function Footer() {
  const { meta, isAmrita } = useBrand();
  return (
    <footer className="relative mt-auto border-t border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/5 dark:bg-slate-950/80">
      <div className="section-pad py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:pr-6">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {meta.tagline}{' '}
              {isAmrita
                ? 'Reports go straight to campus staff so they can act fast.'
                : 'Citizens report, the community verifies, authorities fix.'}
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-primary-500" />
              {isAmrita ? AMRITA_PLACE : 'Bengaluru, Karnataka, India'}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Quick links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="mailto:civiceyeoffcial@gmail.com"
              className="mt-4 flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
            >
              <Mail className="h-4 w-4" />
              civiceyeoffcial@gmail.com
            </a>
          </nav>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Follow us
            </h3>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-500 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              Prototype build — all data shown is simulated for demo purposes.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 sm:flex-row dark:border-white/5">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} {meta.appName}. All rights reserved. Built with ❤️ in
            {isAmrita ? ' Amritapuri & Bengaluru' : ' Bengaluru'}.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-slate-500">
            <Link
              to="/about"
              className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
            >
              Privacy
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
            >
              Terms
            </Link>
            <span className="flex items-center gap-1">
              Made for citizens
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

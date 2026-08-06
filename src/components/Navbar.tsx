import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, GraduationCap, LogOut, Menu, Plus, ShieldCheck, User } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Drawer } from './Drawer';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';
import { isAdminEmail } from '@/data/admins';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/live', label: 'Live AI' },
  { to: '/community', label: 'Community' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/** Sticky glass navbar with a responsive hamburger drawer. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAmrita, signOut } = useAuth();
  const { brand } = useBrand();
  const profileRef = useRef<HTMLDivElement>(null);
  const isAdmin = isAdminEmail(user?.email, brand);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawers whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close the profile menu on outside click.
  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [profileOpen]);

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    navigate('/');
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'py-2' : 'py-3 sm:py-4',
        )}
      >
        <nav
          aria-label="Main navigation"
          className={cn(
            'mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-2xl px-3 transition-all duration-300 sm:px-4',
            scrolled ? 'glass-strong mx-3 shadow-soft sm:mx-auto' : 'bg-transparent',
          )}
        >
          <Logo to="/" />

          {/* Desktop links — centered so adding/removing badges never shifts them */}
          <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-amber-500"
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition-all',
                    isActive
                      ? 'border-primary-500 bg-primary-500/10 text-primary-700 dark:border-primary-400/50 dark:text-primary-300'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300',
                  )
                }
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </NavLink>
            ) : null}
            <NotificationBell />
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-xs font-extrabold text-primary-700 transition-colors hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-primary-300"
                  aria-label="Account menu"
                >
                  {initials}
                </button>
                {profileOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-glow backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
                  >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {profile?.full_name || 'Account'}
                      </p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                      {isAmrita ? (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:text-primary-300">
                          <GraduationCap className="h-3 w-3" />
                          Amrita Eye member
                        </span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => void handleSignOut()}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                ) : null}
              </div>
            ) : (
              <Link to="/login" className="btn-secondary hidden !px-4 !py-2 text-xs sm:inline-flex">
                <User className="h-4 w-4" />
                Sign in
              </Link>
            )}

            <Link to="/report" className="btn-primary hidden !px-4 sm:inline-flex">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Report issue</span>
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <div className="flex h-full flex-col">
          <ul className="flex-1 space-y-1 p-4">
            {NAV_LINKS.map((link, i) => (
              <motion.li
                key={link.to}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
                    )
                  }
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                </NavLink>
              </motion.li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-slate-100 p-4 dark:border-white/10">
            {!user ? (
              <Link to="/login" className="btn-secondary w-full">
                <User className="h-4 w-4" />
                Sign in
              </Link>
            ) : (
              <button onClick={() => void handleSignOut()} className="btn-secondary w-full">
                <LogOut className="h-4 w-4" />
                Sign out ({user.email?.split('@')[0]})
              </button>
            )}
            <Link to="/report" className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Report an issue
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
}

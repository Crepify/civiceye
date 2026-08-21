import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import { Landing } from '@/pages/Landing';
import { Features } from '@/pages/Features';
import { MapPage } from '@/pages/MapPage';
import { ReportPage } from '@/pages/ReportPage';
import { ReportDetails } from '@/pages/ReportDetails';
import { Dashboard } from '@/pages/Dashboard';
import { Community } from '@/pages/Community';
import { LiveDetection } from '@/pages/LiveDetection';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { Login } from '@/pages/Login';
import { AuthCallback } from '@/pages/AuthCallback';
import { ResetPassword } from '@/pages/ResetPassword';
import { AdminPanel } from '@/pages/AdminPanel';
import { NotFound } from '@/pages/NotFound';

/**
 * CivicEye / Amrita Eye application shell.
 * Routes are wrapped in a scroll-restoring, animated layout; the map
 * page intentionally keeps its own full-height layout. Auth pages render
 * without the navbar/footer.
 */
export default function App() {
  const location = useLocation();

  // Auth pages are full-screen and skip the site chrome.
  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/auth/callback') ||
    location.pathname.startsWith('/reset');

  // DEMO MODE (VITE_DEMO_MODE=true): bypass the login gate so pages render
  // without a Supabase session — used for screenshots & live demos.
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  // Everything else requires a signed-in user (login-first app).
  const gatedRoutes = (
    <Routes location={location}>
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/live" element={<LiveDetection />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/report/:id" element={<ReportDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/community" element={<Community />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  const authRoutes = (
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage ? <Navbar /> : null}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          {isAuthPage ? authRoutes : demoMode ? gatedRoutes : <RequireAuth>{gatedRoutes}</RequireAuth>}
        </motion.main>
      </AnimatePresence>
      {!isAuthPage ? <Footer /> : null}
    </div>
  );
}

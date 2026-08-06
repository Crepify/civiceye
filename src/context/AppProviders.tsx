import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { AuthProvider } from './AuthContext';
import { BrandProvider } from './BrandContext';
import { ReportsProvider } from './ReportsContext';
import { NotificationProvider } from './NotificationContext';

/**
 * Composition root for all cross-cutting providers.
 * Order matters: Toast wraps Auth (which toasts errors); Auth wraps Brand
 * (which reacts to the logged-in email); Reports reads public data.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrandProvider>
            <ReportsProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </ReportsProvider>
          </BrandProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

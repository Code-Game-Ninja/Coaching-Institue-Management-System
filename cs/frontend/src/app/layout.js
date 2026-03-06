import './globals.css';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/providers/ThemeProvider';

export const metadata = {
  title: 'CIDMS — Coaching Institute Management',
  description: 'Coaching Institute Data Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

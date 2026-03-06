'use client';
import AuthGuard from '@/components/providers/AuthGuard';
import HoverGradientNavBar from '@/components/layout/HoverGradientNavBar';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg)]">
        <main className="min-h-screen pb-24 md:pb-28">
          {children}
        </main>
        <HoverGradientNavBar />
      </div>
    </AuthGuard>
  );
}

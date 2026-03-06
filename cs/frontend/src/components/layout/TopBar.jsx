'use client';
import { Sun, Moon, LogOut, GraduationCap } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';

export default function TopBar({ title }) {
    const admin = useAuthStore((s) => s.admin);
    const { theme, toggle } = useThemeStore();
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl px-4 md:px-8">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 shadow-lg shadow-accent-500/20">
                    <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button onClick={toggle}
                    className="relative rounded-xl p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    <div className="relative h-4.5 w-4.5">
                        <Sun className={`h-4.5 w-4.5 absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
                        <Moon className={`h-4.5 w-4.5 absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                    </div>
                </button>

                {/* Divider */}
                <div className="mx-1 h-6 w-px bg-[var(--border)]" />

                {/* Admin badge */}
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white bg-gradient-to-br from-accent-500 to-primary-500 shadow-sm">
                        {admin?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--text-secondary)]">{admin?.name || 'Admin'}</span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => {
                        useAuthStore.getState().logout();
                        window.location.href = '/login';
                    }}
                    className="ml-1 rounded-xl p-2.5 text-rose-500 hover:bg-rose-500/10 transition-all"
                    title="Logout"
                >
                    <LogOut className="h-4.5 w-4.5" />
                </button>
            </div>
        </header>
    );
}

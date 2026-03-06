'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, BookOpen, Layers, CreditCard, FileText, LogOut, GraduationCap, X,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useLayoutStore from '@/store/layoutStore';

const navItems = [
    {
        href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard,
        gradient: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.04) 50%, transparent 100%)',
        iconColor: 'group-hover:text-cyan-400',
    },
    {
        href: '/students', label: 'Students', icon: Users,
        gradient: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 50%, transparent 100%)',
        iconColor: 'group-hover:text-blue-400',
    },
    {
        href: '/courses', label: 'Courses', icon: BookOpen,
        gradient: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.04) 50%, transparent 100%)',
        iconColor: 'group-hover:text-green-400',
    },
    {
        href: '/batches', label: 'Batches', icon: Layers,
        gradient: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.04) 50%, transparent 100%)',
        iconColor: 'group-hover:text-orange-400',
    },
    {
        href: '/payments', label: 'Payments', icon: CreditCard,
        gradient: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.04) 50%, transparent 100%)',
        iconColor: 'group-hover:text-purple-400',
    },
    {
        href: '/reports', label: 'Reports', icon: FileText,
        gradient: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.04) 50%, transparent 100%)',
        iconColor: 'group-hover:text-teal-400',
    },
];

const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
        opacity: 1,
        scale: 1.8,
        transition: { opacity: { duration: 0.4 }, scale: { duration: 0.4, type: 'spring', stiffness: 300, damping: 25 } },
    },
};

const labelVariants = {
    initial: { x: 0 },
    hover: { x: 4, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function Sidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((s) => s.logout);
    const { sidebarOpen, setSidebarOpen } = useLayoutStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const sidebarContent = (
        <div className="flex h-full flex-col bg-[var(--bg-sidebar)]">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.06]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg shadow-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                    <span className="text-base font-bold text-white tracking-tight">CIDMS</span>
                    <div className="h-0.5 w-8 rounded-full mt-0.5 bg-gradient-to-r from-accent-400 to-primary-400 opacity-70" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon, gradient, iconColor }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <motion.div key={href} whileHover="hover" initial="initial" className="relative">
                            <Link href={href} onClick={() => setSidebarOpen(false)}
                                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-200 overflow-hidden
                  ${active
                                        ? 'bg-white/[0.1] text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {/* Hover glow */}
                                {!active && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl pointer-events-none"
                                        variants={glowVariants}
                                        style={{ background: gradient, opacity: 0 }}
                                    />
                                )}

                                {/* Active indicator */}
                                {active && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-accent-400 to-primary-400"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <span className={`relative z-10 transition-colors duration-200 ${active ? 'text-accent-400' : `text-slate-500 ${iconColor}`}`}>
                                    <Icon className="h-[18px] w-[18px]" />
                                </span>
                                <motion.span className="relative z-10" variants={!active ? labelVariants : undefined}>
                                    {label}
                                </motion.span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/[0.06] p-3">
                <motion.button whileHover="hover" initial="initial" onClick={handleLogout}
                    className="group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-slate-500 hover:text-red-400 transition-colors overflow-hidden">
                    <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        variants={glowVariants}
                        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.03) 50%, transparent 100%)', opacity: 0 }}
                    />
                    <LogOut className="h-[18px] w-[18px] relative z-10 group-hover:text-red-400 transition-colors" />
                    <motion.span className="relative z-10" variants={labelVariants}>Logout</motion.span>
                </motion.button>
            </div>
        </div>
    );

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animation: 'overlayIn 0.2s ease-out' }} />
                </div>
            )}
            <aside className={`fixed left-0 top-0 z-50 h-screen w-[260px] transition-transform duration-300 ease-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                </button>
                {sidebarContent}
            </aside>
            <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] lg:block border-r border-white/[0.04]">
                {sidebarContent}
            </aside>
        </>
    );
}

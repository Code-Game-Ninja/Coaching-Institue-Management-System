'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, Layers, CreditCard, FileText } from 'lucide-react';

const menuItems = [
    { icon: <LayoutDashboard className="h-4.5 w-4.5" />, label: "Dashboard", href: "/dashboard", gradient: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.06) 50%, rgba(6,182,212,0) 100%)", iconColor: "group-hover:text-cyan-500 dark:group-hover:text-cyan-400" },
    { icon: <Users className="h-4.5 w-4.5" />, label: "Students", href: "/students", gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.06) 50%, rgba(29,78,216,0) 100%)", iconColor: "group-hover:text-blue-500 dark:group-hover:text-blue-400" },
    { icon: <BookOpen className="h-4.5 w-4.5" />, label: "Courses", href: "/courses", gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.06) 50%, rgba(21,128,61,0) 100%)", iconColor: "group-hover:text-green-500 dark:group-hover:text-green-400" },
    { icon: <Layers className="h-4.5 w-4.5" />, label: "Batches", href: "/batches", gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.06) 50%, rgba(194,65,12,0) 100%)", iconColor: "group-hover:text-orange-500 dark:group-hover:text-orange-400" },
    { icon: <CreditCard className="h-4.5 w-4.5" />, label: "Payments", href: "/payments", gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.06) 50%, rgba(147,51,234,0) 100%)", iconColor: "group-hover:text-purple-500 dark:group-hover:text-purple-400" },
    { icon: <FileText className="h-4.5 w-4.5" />, label: "Reports", href: "/reports", gradient: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(13,148,136,0.06) 50%, rgba(15,118,110,0) 100%)", iconColor: "group-hover:text-teal-500 dark:group-hover:text-teal-400" },
];

const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
        opacity: 1,
        scale: 2,
        transition: {
            opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
        },
    },
};

const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
};

function HoverGradientNavBar() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 w-full md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-50 pointer-events-none">
            <motion.nav
                className="w-full md:w-fit mx-auto px-2 md:px-3 py-2 md:py-2.5 rounded-none md:rounded-3xl 
        bg-[var(--bg-elevated)]/90 backdrop-blur-xl 
        border-t md:border border-[var(--border)] 
        shadow-2xl md:shadow-xl relative pointer-events-auto"
                initial="initial"
                whileHover="hover"
            >
                <ul className="flex items-center justify-around md:justify-center gap-1 md:gap-2 relative z-10">
                    {menuItems.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <motion.li key={item.label} className="relative flex-1 md:flex-none">
                                <motion.div
                                    className="block rounded-xl overflow-visible group relative"
                                    style={{ perspective: "600px" }}
                                    whileHover="hover"
                                    initial="initial"
                                >
                                    <motion.div
                                        className="absolute inset-0 z-0 pointer-events-none rounded-xl"
                                        variants={glowVariants}
                                        style={{
                                            background: item.gradient,
                                            opacity: 0,
                                        }}
                                    />
                                    <motion.a
                                        href={item.href}
                                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 
                    px-2 py-1.5 md:px-3 md:py-2 relative z-10 
                    transition-colors rounded-xl text-[11px] md:text-sm
                    ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        variants={itemVariants}
                                        transition={sharedTransition}
                                        style={{
                                            transformStyle: "preserve-3d",
                                            transformOrigin: "center bottom"
                                        }}
                                    >
                                        <span className={`transition-colors duration-300 ${active ? item.iconColor.replace('group-hover:', '') : item.iconColor}`}>
                                            {item.icon}
                                        </span>
                                        <span className="md:inline font-medium">{item.label}</span>
                                    </motion.a>

                                    <motion.a
                                        href={item.href}
                                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 
                    px-2 py-1.5 md:px-3 md:py-2 absolute inset-0 z-10 
                    transition-colors rounded-xl text-[11px] md:text-sm
                    ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        variants={backVariants}
                                        transition={sharedTransition}
                                        style={{
                                            transformStyle: "preserve-3d",
                                            transformOrigin: "center top",
                                            transform: "rotateX(90deg)"
                                        }}
                                    >
                                        <span className={`transition-colors duration-300 ${active ? item.iconColor.replace('group-hover:', '') : item.iconColor}`}>
                                            {item.icon}
                                        </span>
                                        <span className="md:inline font-medium">{item.label}</span>
                                    </motion.a>

                                    {/* Active indicator */}
                                    {active && (
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent-400" />
                                    )}
                                </motion.div>
                            </motion.li>
                        );
                    })}
                </ul>
            </motion.nav>
        </div>
    );
}

export default HoverGradientNavBar;

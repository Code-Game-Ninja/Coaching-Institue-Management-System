'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const barVariants = {
    hidden: { scaleY: 0 },
    visible: (i) => ({
        scaleY: 1,
        transition: { delay: i * 0.02, type: 'spring', stiffness: 100, damping: 12 },
    }),
};

export default function ActivityCard({ totalLabel, totalValue, barData = [], timeLabels = [], topItems = [], className }) {
    const maxValue = Math.max(...barData, 1);
    const normalizedData = barData.map((v) => v / maxValue);

    return (
        <div className={cn(
            'w-full rounded-2xl border border-[var(--border)] bg-gradient-to-br from-accent-50/30 via-primary-50/20 to-cyan-50/30 dark:from-accent-950/20 dark:via-primary-950/10 dark:to-cyan-950/20 shadow-sm px-5 py-4 backdrop-blur-sm',
            className
        )}>
            <div className="flex gap-8">
                {/* Left — Bar graph */}
                <div className="flex-1">
                    <div className="mb-3">
                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{totalLabel}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{totalValue}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex h-28 flex-col justify-between pointer-events-none">
                            <div className="h-px border-t border-dashed border-[var(--border)]/50" />
                            <div className="h-px border-t border-dashed border-[var(--border)]/50" />
                            <div className="h-px border-t border-dashed border-[var(--border)]/50" />
                        </div>
                        <div className="mb-1.5 flex h-28 items-end gap-[3px] relative z-10">
                            {normalizedData.map((height, index) => {
                                const isHighlighted = height > 0.5;
                                return (
                                    <motion.div
                                        key={index}
                                        custom={index}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={cn(
                                            'flex-1 rounded-t-sm origin-bottom',
                                            isHighlighted
                                                ? 'bg-gradient-to-t from-accent-500 to-primary-400'
                                                : 'bg-[var(--bg-surface)] dark:bg-slate-700/50'
                                        )}
                                        style={{ height: `${Math.max(height * 100, 4)}%` }}
                                    />
                                );
                            })}
                        </div>
                        {timeLabels.length > 0 && (
                            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                                {timeLabels.map((label, i) => <span key={i}>{label}</span>)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                {topItems.length > 0 && <div className="w-px bg-[var(--border)] self-stretch" />}

                {/* Right — Top items */}
                {topItems.length > 0 && (
                    <div className="flex flex-col gap-3 justify-center min-w-[120px]">
                        {topItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="flex items-center gap-2.5"
                            >
                                <div className="flex h-6 w-6 items-center justify-center text-[var(--text-secondary)]">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-[var(--text-primary)]">{item.value}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{item.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

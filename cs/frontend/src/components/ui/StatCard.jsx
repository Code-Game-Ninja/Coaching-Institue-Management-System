export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
    const iconStyles = {
        primary: 'from-primary-500 to-accent-500 shadow-primary-500/25',
        success: 'from-emerald-500 to-green-400 shadow-emerald-500/25',
        warning: 'from-amber-500 to-orange-400 shadow-amber-500/25',
        danger: 'from-rose-500 to-red-400 shadow-rose-500/25',
        info: 'from-sky-500 to-cyan-400 shadow-sky-500/25',
    };

    return (
        <div className="group relative card p-5 overflow-hidden shimmer-hover">
            <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconStyles[color]} shadow-lg transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                {trend && (
                    <span className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-semibold
            ${trend > 0
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
                <p className="mt-0.5 text-[13px] font-medium text-[var(--text-muted)]">{label}</p>
            </div>
        </div>
    );
}

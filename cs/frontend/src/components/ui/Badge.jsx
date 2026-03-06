export default function Badge({ children, variant = 'default' }) {
    const styles = {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
        warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
        danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
        info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
        accent: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200/60 dark:bg-accent-500/10 dark:text-accent-400 dark:ring-accent-500/20',
    };

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${styles[variant] || styles.default}`}>
            {children}
        </span>
    );
}

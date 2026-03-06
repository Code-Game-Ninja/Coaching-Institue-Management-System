import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'Try adjusting your search or filters.', icon: Icon = Inbox }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-2xl bg-[var(--bg-surface)] p-4 mb-4">
                <Icon className="h-10 w-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
        </div>
    );
}

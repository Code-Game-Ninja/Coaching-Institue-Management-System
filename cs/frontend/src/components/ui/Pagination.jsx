import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-[var(--border)] px-1 pt-4 mt-4">
            <p className="text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${pageNum === page
                                    ? 'bg-primary-500 text-white'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                                }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

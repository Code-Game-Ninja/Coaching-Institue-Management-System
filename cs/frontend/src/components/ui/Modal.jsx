'use client';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                style={{ animation: 'overlayIn 0.2s ease-out' }}
                onClick={onClose}
            />
            <div
                className={`relative w-full ${maxWidth} rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-2xl overflow-hidden`}
                style={{ animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {/* Accent line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />

                <div className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

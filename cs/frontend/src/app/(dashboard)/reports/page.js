'use client';
import { useState } from 'react';
import { Download, FileSpreadsheet, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { reportsAPI } from '@/lib/api';

export default function ReportsPage() {
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await reportsAPI.exportStudents();
      downloadBlob(new Blob([res]), 'students-report.csv');
      toast.success('Students report downloaded');
    } catch { toast.error('Failed to export'); }
    setLoadingStudents(false);
  };

  const exportPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await reportsAPI.exportPayments();
      downloadBlob(new Blob([res]), 'payments-report.csv');
      toast.success('Payments report downloaded');
    } catch { toast.error('Failed to export'); }
    setLoadingPayments(false);
  };

  const reports = [
    {
      title: 'Students Report',
      description: 'Export a comprehensive list of all students with their course, batch, and fee information.',
      icon: Users,
      color: 'primary',
      loading: loadingStudents,
      action: exportStudents,
    },
    {
      title: 'Payments Report',
      description: 'Export all payment records with student details, amounts, modes, and dates.',
      icon: CreditCard,
      color: 'success',
      loading: loadingPayments,
      action: exportPayments,
    },
  ];

  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <>
      <TopBar title="Reports" />
      <div className="page-enter p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((r) => (
            <div key={r.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 transition-all hover:shadow-md hover:border-[var(--border-hover)]">
              <div className={`inline-flex rounded-xl p-3 ${colors[r.color]}`}>
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{r.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{r.description}</p>
              <button
                onClick={r.action}
                disabled={r.loading}
                className="mt-5 flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Download className="h-4 w-4" />
                {r.loading ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

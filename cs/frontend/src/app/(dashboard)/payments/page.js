'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { paymentsAPI, studentsAPI, emailAPI } from '@/lib/api';

export default function PaymentsPage() {
  const [tab, setTab] = useState('all');
  const [payments, setPayments] = useState([]);
  const [pending, setPending] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({ student: '', amount: '', paymentMode: 'Cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' });

  // Reminder state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTarget, setReminderTarget] = useState(null); // null = bulk, object = single student
  const [reminderForm, setReminderForm] = useState({ dueDate: '', message: '' });
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'all') {
        const res = await paymentsAPI.getAll({ page, limit: 10 });
        setPayments(res.data?.items || []);
        setTotalPages(res.data?.pagination?.totalPages || 1);
      } else {
        const res = await paymentsAPI.getPending();
        setPending(Array.isArray(res.data) ? res.data : []);
      }
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab, page]);
  useEffect(() => { studentsAPI.getAll({ limit: 1000 }).then(r => setStudents(r.data?.items || [])); }, []);

  const handleStudentSelect = (id) => {
    setForm({ ...form, student: id });
    setSelectedStudent(students.find(s => s._id === id) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentsAPI.create(form);
      toast.success('Payment recorded');
      setShowModal(false);
      setForm({ student: '', amount: '', paymentMode: 'Cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
      setSelectedStudent(null);
      load();
    } catch (err) { toast.error(err?.errors?.[0]?.message || err?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment?')) return;
    try { await paymentsAPI.delete(id); toast.success('Payment deleted'); load(); }
    catch (err) { toast.error(err?.message || 'Failed'); }
  };

  // Reminder handlers
  const openSingleReminder = (student) => {
    setReminderTarget(student);
    setReminderForm({ dueDate: '', message: '' });
    setShowReminderModal(true);
  };

  const openBulkReminder = () => {
    setReminderTarget(null);
    setReminderForm({ dueDate: '', message: '' });
    setShowReminderModal(true);
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      if (reminderTarget) {
        const res = await emailAPI.sendReminder({ studentId: reminderTarget._id, dueDate: reminderForm.dueDate, message: reminderForm.message });
        toast.success(res.message || `Reminder sent to ${reminderTarget.email}`);
      } else {
        const res = await emailAPI.bulkReminder({ dueDate: reminderForm.dueDate, message: reminderForm.message });
        toast.success(res.message || `Sent ${res.data?.sent} reminders`);
      }
      setShowReminderModal(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to send reminder');
    }
    setSending(false);
  };

  const inputClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all";

  return (
    <>
      <TopBar title="Payments" />
      <div className="page-enter p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1">
            {['all', 'pending'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setPage(1); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                {t === 'all' ? 'All Payments' : 'Pending Fees'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {tab === 'pending' && pending.length > 0 && (
              <button onClick={openBulkReminder} className="flex items-center gap-2 rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:-translate-y-0.5 transition-all">
                <Send className="h-4 w-4" /> Send All Reminders
              </button>
            )}
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all">
              <Plus className="h-4 w-4" /> Record Payment
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : tab === 'all' ? (
          payments.length === 0 ? <EmptyState title="No payments yet" description="Record your first payment." /> : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Student</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden md:table-cell">Mode</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden md:table-cell">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{p.student?.name}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 hidden md:table-cell"><Badge>{p.paymentMode}</Badge></td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(p._id)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
            </div>
          )
        ) : (
          pending.length === 0 ? <EmptyState title="No pending fees" description="All students have cleared their fees!" /> : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Student</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Total Fees</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Paid</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Remaining</th>
                      <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">Remind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((s) => (
                      <tr key={s._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{s.name}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">₹{s.totalFees?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">₹{s.feesPaid?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">₹{(s.totalFees - s.feesPaid)?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openSingleReminder(s)}
                            disabled={!s.email}
                            title={s.email ? `Send reminder to ${s.email}` : 'No email address'}
                            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* Record Payment Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Student *</label>
              <select required value={form.student} onChange={(e) => handleStudentSelect(e.target.value)} className={inputClass}>
                <option value="">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} — ₹{s.totalFees - s.feesPaid} remaining</option>)}
              </select>
            </div>
            {selectedStudent && (
              <div className="rounded-xl bg-[var(--bg-surface)] p-3 text-sm">
                <span className="text-[var(--text-muted)]">Remaining: </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">₹{(selectedStudent.totalFees - selectedStudent.feesPaid).toLocaleString()}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Amount (₹) *</label>
                <input type="number" required min="1" max={selectedStudent ? selectedStudent.totalFees - selectedStudent.feesPaid : undefined} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Payment Mode *</label>
                <select required value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={inputClass}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Payment Date</label>
              <input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Record Payment</button>
            </div>
          </form>
        </Modal>

        {/* Send Reminder Modal */}
        <Modal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} title={reminderTarget ? `Send Reminder to ${reminderTarget.name}` : 'Send Reminders to All'}>
          <form onSubmit={handleSendReminder} className="space-y-4">
            {reminderTarget && (
              <div className="rounded-xl bg-[var(--bg-surface)] p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Email</span>
                  <span className="font-medium text-[var(--text-primary)]">{reminderTarget.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Remaining</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">₹{(reminderTarget.totalFees - reminderTarget.feesPaid)?.toLocaleString()}</span>
                </div>
              </div>
            )}
            {!reminderTarget && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This will send fee reminder emails to <strong>all {pending.filter(s => s.email).length} students</strong> with pending fees and valid email addresses.
                </p>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Due Date *</label>
              <input type="date" required value={reminderForm.dueDate} onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Custom Message (optional)</label>
              <textarea value={reminderForm.message} onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })} rows={3} placeholder="Any additional message for the student..." className={`${inputClass} resize-none`} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowReminderModal(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" disabled={sending} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-60">
                <Mail className="h-4 w-4" /> {sending ? 'Sending...' : reminderTarget ? 'Send Reminder' : `Send to All (${pending.filter(s => s.email).length})`}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

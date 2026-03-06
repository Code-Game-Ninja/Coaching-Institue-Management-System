'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Mail, Phone, MapPin, Calendar, BookOpen, Layers, Send } from 'lucide-react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { studentsAPI, coursesAPI, batchesAPI, paymentsAPI, emailAPI } from '@/lib/api';

export default function StudentProfilePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({ dueDate: '', message: '' });
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    Promise.all([
      studentsAPI.getOne(id),
      paymentsAPI.getAll({ student: id }),
      coursesAPI.getAll(),
    ]).then(([sRes, pRes, cRes]) => {
      const s = sRes.data?.student || sRes.data;
      setStudent(s);
      setPayments(sRes.data?.paymentHistory || []);
      setCourses(Array.isArray(cRes.data) ? cRes.data : []);
      if (s?.course?._id || s?.course) {
        batchesAPI.getAll({ course: s.course._id || s.course }).then(bRes => setBatches(Array.isArray(bRes.data) ? bRes.data : []));
      }
      setForm({
        name: s.name, phone: s.phone, email: s.email || '', status: s.status,
        course: s.course?._id || s.course, batch: s.batch?._id || s.batch,
        totalFees: s.totalFees, address: s.address || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const loadBatches = async (courseId) => {
    const res = await batchesAPI.getAll({ course: courseId });
    setBatches(Array.isArray(res.data) ? res.data : []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await studentsAPI.update(id, form);
      toast.success('Student updated');
      setShowEdit(false);
      const res = await studentsAPI.getOne(id);
      setStudent(res.data?.student || res.data);
    } catch (err) {
      toast.error(err?.message || 'Failed');
    }
  };

  if (loading) return <><TopBar title="Student Profile" /><LoadingSpinner /></>;
  if (!student) return <><TopBar title="Student Profile" /><div className="p-8 text-center text-[var(--text-muted)]">Student not found</div></>;

  const feePercent = student.totalFees > 0 ? Math.round((student.feesPaid / student.totalFees) * 100) : 0;

  return (
    <>
      <TopBar title="Student Profile" />
      <div className="page-enter p-4 md:p-8 space-y-6">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </button>

        {/* Profile Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-accent-600 via-primary-500 to-accent-500" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 rounded-2xl bg-[var(--bg-elevated)] border-4 border-[var(--bg-elevated)] flex items-center justify-center text-2xl font-bold text-accent-600 dark:text-accent-400 shadow-md">
                  {student.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{student.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={student.status === 'active' ? 'success' : student.status === 'completed' ? 'primary' : 'danger'}>{student.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {student.feesPaid < student.totalFees && student.email && (
                  <button onClick={() => { setReminderForm({ dueDate: '', message: '' }); setShowReminderModal(true); }} className="flex items-center gap-2 rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all">
                    <Send className="h-4 w-4" /> Send Reminder
                  </button>
                )}
                <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Phone, label: 'Phone', value: student.phone },
                { icon: Mail, label: 'Email', value: student.email || 'N/A' },
                { icon: BookOpen, label: 'Course', value: student.course?.name || 'N/A' },
                { icon: Layers, label: 'Batch', value: student.batch?.name || 'N/A' },
                { icon: Calendar, label: 'Admission', value: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A' },
                { icon: MapPin, label: 'Address', value: student.address || 'N/A' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-[var(--bg-surface)] p-3.5">
                  <Icon className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Fee Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">₹{student.totalFees?.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Total Fees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">₹{student.feesPaid?.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">₹{(student.totalFees - student.feesPaid)?.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Remaining</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-[var(--bg-surface)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500" style={{ width: `${feePercent}%` }} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 text-right">{feePercent}% collected</p>
        </div>

        {/* Payment History */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Payment History</h3>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 text-left font-medium text-[var(--text-muted)]">Date</th>
                    <th className="pb-3 pr-4 text-left font-medium text-[var(--text-muted)]">Mode</th>
                    <th className="pb-3 pr-4 text-left font-medium text-[var(--text-muted)]">Notes</th>
                    <th className="pb-3 text-right font-medium text-[var(--text-muted)]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-3 pr-4 text-[var(--text-primary)]">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="py-3 pr-4"><Badge>{p.paymentMode}</Badge></td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">{p.notes || '-'}</td>
                      <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Student" maxWidth="max-w-2xl">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name', key: 'name', required: true },
                { label: 'Phone', key: 'phone', required: true },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(({ label, key, ...props }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
                  <input {...props} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Status</label>
                <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Course</label>
                <select required value={form.course || ''} onChange={(e) => { setForm({ ...form, course: e.target.value, batch: '' }); loadBatches(e.target.value); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all">
                  <option value="">Select Course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Batch</label>
                <select required value={form.batch || ''} onChange={(e) => setForm({ ...form, batch: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all">
                  <option value="">Select Batch</option>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Total Fees</label>
                <input type="number" min="0" required value={form.totalFees || ''} onChange={(e) => setForm({ ...form, totalFees: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Address</label>
              <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowEdit(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Update</button>
            </div>
          </form>
        </Modal>

        {/* Fee Reminder Modal */}
        <Modal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} title={`Send Fee Reminder to ${student?.name}`}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            try {
              const res = await emailAPI.sendReminder({ studentId: id, dueDate: reminderForm.dueDate, message: reminderForm.message });
              toast.success(res.message || `Reminder sent to ${student.email}`);
              setShowReminderModal(false);
            } catch (err) { toast.error(err?.message || 'Failed to send'); }
            setSending(false);
          }} className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-surface)] p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Email</span>
                <span className="font-medium text-[var(--text-primary)]">{student?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Remaining Fees</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">₹{(student?.totalFees - student?.feesPaid)?.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Due Date *</label>
              <input type="date" required value={reminderForm.dueDate} onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Custom Message (optional)</label>
              <textarea value={reminderForm.message} onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })} rows={3} placeholder="Any additional message..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowReminderModal(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" disabled={sending} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-60">
                <Mail className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Reminder'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { studentsAPI, coursesAPI, batchesAPI } from '@/lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', admissionDate: '', course: '', batch: '', totalFees: '', address: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll({ search, page, limit: 10 });
      setStudents(res.data?.items || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { coursesAPI.getAll().then(r => setCourses(Array.isArray(r.data) ? r.data : [])); }, []);

  const loadBatches = async (courseId) => {
    if (!courseId) return setBatches([]);
    const res = await batchesAPI.getAll({ course: courseId });
    setBatches(Array.isArray(res.data) ? res.data : []);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', admissionDate: new Date().toISOString().split('T')[0], course: '', batch: '', totalFees: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name, phone: s.phone, email: s.email || '',
      admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
      course: s.course?._id || s.course, batch: s.batch?._id || s.batch,
      totalFees: s.totalFees, address: s.address || '',
    });
    loadBatches(s.course?._id || s.course);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalFees: Number(form.totalFees) };
      if (editing) {
        await studentsAPI.update(editing._id, payload);
        toast.success('Student updated');
      } else {
        await studentsAPI.create(payload);
        toast.success('Student added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg = err?.errors?.length ? err.errors.map(e => e.message).join(', ') : err?.message || 'Failed';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await studentsAPI.delete(id);
      toast.success('Student deleted');
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed');
    }
  };

  return (
    <>
      <TopBar title="Students" />
      <div className="page-enter p-4 md:p-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search students..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
            />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner /> : students.length === 0 ? <EmptyState title="No students yet" description="Add your first student to get started." /> : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden lg:table-cell">Course</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Fees</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/students/${s._id}`} className="font-medium text-[var(--text-primary)] hover:text-primary-500 transition-colors">{s.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">{s.phone}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] hidden lg:table-cell">{s.course?.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.feesPaid >= s.totalFees ? 'success' : 'warning'}>
                          ₹{s.feesPaid || 0}/{s.totalFees}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === 'active' ? 'success' : s.status === 'completed' ? 'primary' : 'danger'}>{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-primary-500 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(s._id)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Student' : 'Add Student'} maxWidth="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name *', key: 'name', required: true },
                { label: 'Phone *', key: 'phone', required: true, placeholder: '10-digit phone', pattern: '[6-9]\\d{9}', maxLength: 10, title: 'Enter a valid 10-digit Indian phone number' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Admission Date', key: 'admissionDate', type: 'date' },
              ].map(({ label, key, ...props }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
                  <input
                    {...props}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Course *</label>
                <select required value={form.course} onChange={(e) => { setForm({ ...form, course: e.target.value, batch: '' }); loadBatches(e.target.value); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all">
                  <option value="">Select Course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Batch *</label>
                <select required value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all">
                  <option value="">Select Batch</option>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Total Fees *</label>
                <input type="number" required min="0" value={form.totalFees} onChange={(e) => setForm({ ...form, totalFees: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">{editing ? 'Update' : 'Add'} Student</button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

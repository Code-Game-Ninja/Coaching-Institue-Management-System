'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { batchesAPI, coursesAPI } from '@/lib/api';

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', course: '', teacher: '', timing: '', startDate: '', endDate: '', isActive: true });

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter) params.course = filter;
      const res = await batchesAPI.getAll(params);
      setBatches(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filter]);
  useEffect(() => { coursesAPI.getAll().then(r => setCourses(Array.isArray(r.data) ? r.data : [])); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', course: '', teacher: '', timing: '', startDate: '', endDate: '', isActive: true }); setShowModal(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name, course: b.course?._id || b.course, teacher: b.teacher || '', timing: b.timing || '',
      startDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '',
      endDate: b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '',
      isActive: b.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await batchesAPI.update(editing._id, form); toast.success('Batch updated'); }
      else { await batchesAPI.create(form); toast.success('Batch created'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch?')) return;
    try { await batchesAPI.delete(id); toast.success('Batch deleted'); load(); }
    catch (err) { toast.error(err?.message || 'Failed'); }
  };

  const inputClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all";

  return (
    <>
      <TopBar title="Batches" />
      <div className="page-enter p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className={`w-full sm:w-56 ${inputClass}`}>
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all">
            <Plus className="h-4 w-4" /> Add Batch
          </button>
        </div>

        {loading ? <LoadingSpinner /> : batches.length === 0 ? <EmptyState title="No batches yet" description="Create your first batch to get started." /> : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Batch</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden md:table-cell">Course</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden lg:table-cell">Teacher</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] hidden lg:table-cell">Timing</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{b.name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">{b.course?.name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] hidden lg:table-cell">{b.teacher || '-'}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] hidden lg:table-cell">{b.timing || '-'}</td>
                      <td className="px-4 py-3"><Badge variant={b.isActive ? 'success' : 'danger'}>{b.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-primary-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(b._id)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Batch' : 'Add Batch'} maxWidth="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Batch Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Course *</label>
                <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className={inputClass}>
                  <option value="">Select Course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Teacher</label>
                <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Timing</label>
                <input value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })} placeholder="e.g. 9 AM - 11 AM" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Start Date *</label>
                <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">End Date *</label>
                <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-[var(--border)] text-primary-500 focus:ring-primary-500" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Active</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">{editing ? 'Update' : 'Create'} Batch</button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { coursesAPI } from '@/lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration: '', totalFees: '', description: '', isActive: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getAll();
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', duration: '', totalFees: '', description: '', isActive: true }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, duration: c.duration, totalFees: c.totalFees, description: c.description || '', isActive: c.isActive }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalFees: Number(form.totalFees) };
      if (editing) { await coursesAPI.update(editing._id, payload); toast.success('Course updated'); }
      else { await coursesAPI.create(payload); toast.success('Course created'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err?.errors?.[0]?.message || err?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await coursesAPI.delete(id); toast.success('Course deleted'); load(); }
    catch (err) { toast.error(err?.message || 'Failed'); }
  };

  return (
    <>
      <TopBar title="Courses" />
      <div className="page-enter p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all">
            <Plus className="h-4 w-4" /> Add Course
          </button>
        </div>

        {loading ? <LoadingSpinner /> : courses.length === 0 ? <EmptyState title="No courses yet" description="Create your first course to get started." /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c._id} className="group rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 transition-all hover:shadow-md hover:border-[var(--border-hover)] hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{c.name}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{c.duration}</p>
                  </div>
                  <Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {c.description && <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">{c.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-500">₹{c.totalFees?.toLocaleString()}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-primary-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(c._id)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Course' : 'Add Course'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Course Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Duration *</label>
                <input required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 Months" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Total Fees (₹) *</label>
                <input type="number" required min="0" value={form.totalFees} onChange={(e) => setForm({ ...form, totalFees: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-[var(--border)] text-primary-500 focus:ring-primary-500" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Active</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all">Cancel</button>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">{editing ? 'Update' : 'Create'} Course</button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

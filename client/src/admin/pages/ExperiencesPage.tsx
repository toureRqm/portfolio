import { useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';
import ExperienceForm from '../components/ExperienceForm';
import type { Experience } from '../../types';

export default function ExperiencesPage() {
  const { data: experiences, loading, refetch } = useAdminApi<Experience[]>('/api/admin/experiences');
  const [formOpen, setFormOpen] = useState(false);
  const [editExp, setEditExp] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this experience? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/experiences/${id}`);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (exp: Experience) => {
    await axios.put(`/api/admin/experiences/${exp.id}`, { ...exp, is_visible: !exp.is_visible });
    refetch();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: '#9ca3af' }}>{experiences?.length ?? 0} experiences total</p>
        <button
          onClick={() => { setEditExp(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#c9a96e', color: '#000' }}
        >
          <Plus size={16} />
          New Experience
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin" style={{ color: '#c9a96e' }} />
        </div>
      )}

      {!loading && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a35' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#16161d', borderBottom: '1px solid #2a2a35' }}>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Position</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Period</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Type</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Visible</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiences?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ color: '#6b7280' }}>
                    No experiences yet. Click "New Experience" to add one.
                  </td>
                </tr>
              )}
              {experiences?.map((exp, i) => (
                <tr
                  key={exp.id}
                  style={{ background: i % 2 === 0 ? '#16161d' : '#111118', borderBottom: '1px solid #2a2a35' }}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{exp.job_title}</span>
                    <span className="text-xs block mt-0.5" style={{ color: '#c9a96e' }}>{exp.company}</span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#9ca3af' }}>
                    {formatDate(exp.date_start)} – {formatDate(exp.date_end)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs capitalize" style={{ background: '#2a2a35', color: '#9ca3af' }}>
                      {exp.work_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleVisible(exp)}
                      style={{ color: exp.is_visible ? '#4ade80' : '#6b7280' }}
                      title={exp.is_visible ? 'Click to hide' : 'Click to show'}
                    >
                      {exp.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditExp(exp); setFormOpen(true); }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.background = '#c9a96e15'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#ef444415'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        title="Delete"
                      >
                        {deletingId === exp.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <ExperienceForm
          experience={editExp}
          onSaved={() => { setFormOpen(false); setEditExp(null); refetch(); }}
          onCancel={() => { setFormOpen(false); setEditExp(null); }}
        />
      )}
    </div>
  );
}

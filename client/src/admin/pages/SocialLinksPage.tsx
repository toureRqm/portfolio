import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Plus, Trash2, Save, Loader2, GripVertical } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';
import type { SocialLink } from '../../types';

const INPUT_STYLE: React.CSSProperties = {
  background: '#0a0a0f',
  border: '1px solid #2a2a35',
  color: '#fff',
  borderRadius: '0.5rem',
  padding: '0.45rem 0.75rem',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
};

const ICON_OPTIONS = [
  'linkedin', 'github', 'mail', 'twitter', 'instagram', 'youtube', 'globe',
];

const EMPTY: Omit<SocialLink, 'id'> = {
  label: '',
  url: '',
  icon_name: 'globe',
  sort_order: 0,
  is_visible: true,
};

export default function SocialLinksPage() {
  const { data: links, loading, refetch } = useAdminApi<SocialLink[]>('/api/admin/social-links');
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState({ ...EMPTY });
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [editMap, setEditMap] = useState<Record<number, SocialLink>>({});

  const focus = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#c9a96e'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#2a2a35'; },
  };

  const getEdit = (link: SocialLink) => editMap[link.id] ?? link;

  const patchEdit = (id: number, patch: Partial<SocialLink>) =>
    setEditMap((m) => ({ ...m, [id]: { ...(m[id] ?? links!.find((l) => l.id === id)!), ...patch } }));

  const saveLink = async (id: number) => {
    const data = editMap[id];
    if (!data) return;
    setSaving(id);
    setError('');
    try {
      await axios.put(`/api/admin/social-links/${id}`, data);
      refetch();
      setEditMap((m) => { const c = { ...m }; delete c[id]; return c; });
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setError(e.response?.data?.error ?? 'Save failed');
    } finally {
      setSaving(null);
    }
  };

  const deleteLink = async (id: number) => {
    if (!confirm('Delete this link?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/social-links/${id}`);
      refetch();
    } catch {
      setError('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const createLink = async () => {
    if (!newLink.label || !newLink.url) return setError('Label and URL are required');
    setSaving(-1);
    setError('');
    try {
      await axios.post('/api/admin/social-links', newLink);
      setNewLink({ ...EMPTY });
      setAdding(false);
      refetch();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setError(e.response?.data?.error ?? 'Create failed');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin" style={{ color: '#c9a96e' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-syne font-bold text-white text-xl">Social Links</h2>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Links displayed in the Contact section. Supports linkedin, github, mail, twitter, instagram, youtube, globe icons.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#c9a96e', color: '#000' }}
        >
          <Plus size={15} />
          Add Link
        </button>
      </div>

      {error && (
        <p className="py-2 px-3 rounded-lg text-sm" style={{ background: '#ef444420', color: '#f87171' }}>
          {error}
        </p>
      )}

      {/* Existing links */}
      <div className="space-y-3">
        {(links ?? []).map((link) => {
          const ed = getEdit(link);
          const isDirty = !!editMap[link.id];
          return (
            <div key={link.id} className="p-4 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
              <div className="flex items-center gap-3">
                <GripVertical size={16} style={{ color: '#3a3a45', flexShrink: 0 }} />
                <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-3 flex-1 items-center">
                  {/* Label */}
                  <input
                    value={ed.label}
                    onChange={(e) => patchEdit(link.id, { label: e.target.value })}
                    placeholder="Label"
                    style={INPUT_STYLE}
                    {...focus}
                  />
                  {/* URL */}
                  <input
                    value={ed.url}
                    onChange={(e) => patchEdit(link.id, { url: e.target.value })}
                    placeholder="https://..."
                    style={INPUT_STYLE}
                    {...focus}
                  />
                  {/* Icon */}
                  <select
                    value={ed.icon_name}
                    onChange={(e) => patchEdit(link.id, { icon_name: e.target.value })}
                    style={{ ...INPUT_STYLE, width: 'auto', paddingRight: '0.5rem' }}
                    {...focus}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  {/* Visible toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs" style={{ color: '#9ca3af', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={ed.is_visible}
                      onChange={(e) => patchEdit(link.id, { is_visible: e.target.checked })}
                      style={{ accentColor: '#c9a96e' }}
                    />
                    Visible
                  </label>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDirty && (
                      <button
                        onClick={() => saveLink(link.id)}
                        disabled={saving === link.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: '#c9a96e', color: '#000' }}
                      >
                        {saving === link.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save
                      </button>
                    )}
                    <button
                      onClick={() => deleteLink(link.id)}
                      disabled={deleting === link.id}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                      style={{ background: '#2a2a35', color: '#6b7280' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                    >
                      {deleting === link.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new link form */}
      {adding && (
        <div className="p-4 rounded-xl" style={{ background: '#16161d', border: '1px solid #c9a96e40' }}>
          <p className="text-sm font-medium text-white mb-3">New Link</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Label</label>
              <input
                value={newLink.label}
                onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Portfolio"
                style={INPUT_STYLE}
                {...focus}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Icon</label>
              <select
                value={newLink.icon_name}
                onChange={(e) => setNewLink((p) => ({ ...p, icon_name: e.target.value }))}
                style={INPUT_STYLE}
                {...focus}
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>URL</label>
            <input
              value={newLink.url}
              onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://... or mailto:..."
              style={INPUT_STYLE}
              {...focus}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createLink}
              disabled={saving === -1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#c9a96e', color: '#000' }}
            >
              {saving === -1 ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setNewLink({ ...EMPTY }); setError(''); }}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: '#2a2a35', color: '#9ca3af' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

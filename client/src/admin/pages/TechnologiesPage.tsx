import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Upload, Loader2, Pencil, Check, X } from 'lucide-react';
import type { Technology } from '../../types';

const INPUT_STYLE: React.CSSProperties = {
  background: '#0a0a0f',
  border: '1px solid #2a2a35',
  color: '#fff',
  borderRadius: '0.5rem',
  padding: '0.4rem 0.6rem',
  fontSize: '0.875rem',
  outline: 'none',
};

export default function TechnologiesPage() {
  const [techs, setTechs] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#888888');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit inline
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [saving, setSaving] = useState(false);

  // Icon upload
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<number | null>(null);

  const load = async () => {
    try {
      const { data } = await axios.get<Technology[]>('/api/admin/technologies');
      setTechs(data);
    } catch {/* */} finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const { data } = await axios.post<Technology>('/api/admin/technologies', { name: newName.trim(), color: newColor });
      setTechs((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewColor('#888888');
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this technology? It will be removed from all projects and experiences.')) return;
    try {
      await axios.delete(`/api/admin/technologies/${id}`);
      setTechs((prev) => prev.filter((t) => t.id !== id));
    } catch {/* */}
  };

  const startEdit = (tech: Technology) => {
    setEditId(tech.id);
    setEditName(tech.name);
    setEditColor(tech.color);
  };

  const cancelEdit = () => { setEditId(null); };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      const { data } = await axios.put<Technology>(`/api/admin/technologies/${id}`, { name: editName, color: editColor });
      setTechs((prev) => prev.map((t) => (t.id === id ? data : t)));
      setEditId(null);
    } catch {/* */} finally {
      setSaving(false);
    }
  };

  const triggerIconUpload = (id: number) => {
    uploadTargetRef.current = id;
    fileInputRef.current?.click();
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = uploadTargetRef.current;
    if (!file || !id) return;
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append('icon', file);
      const { data } = await axios.post<{ url: string }>(`/api/admin/technologies/${id}/icon`, fd);
      setTechs((prev) => prev.map((t) => (t.id === id ? { ...t, icon_url: data.url } : t)));
    } catch {/* */} finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">Technologies Library</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
          Manage your technology stack. Add icons to display them visually in projects and experiences.
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="flex gap-3 items-end mb-6 p-4 rounded-xl"
        style={{ background: '#16161d', border: '1px solid #2a2a35' }}
      >
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Name *</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="React, Node.js, TypeScript..."
            style={{ ...INPUT_STYLE, width: '100%' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a96e')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-9 h-9 rounded-lg cursor-pointer border-0"
              style={{ background: 'transparent', padding: '2px' }}
            />
            <input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{ ...INPUT_STYLE, width: '6rem' }}
              placeholder="#888888"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium h-9"
          style={{ background: '#c9a96e', color: '#000', opacity: adding || !newName.trim() ? 0.6 : 1 }}
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
        {addError && <p className="text-xs self-center" style={{ color: '#f87171' }}>{addError}</p>}
      </form>

      {/* Tech list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#16161d' }} />
          ))}
        </div>
      ) : techs.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
          <p style={{ color: '#6b7280' }}>No technologies yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a35' }}>
          {techs.map((tech, idx) => (
            <div
              key={tech.id}
              className="flex items-center gap-4 px-4 py-3"
              style={{
                background: '#16161d',
                borderTop: idx > 0 ? '1px solid #2a2a35' : 'none',
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: tech.color + '20', border: `1px solid ${tech.color}40` }}
              >
                {tech.icon_url ? (
                  <img src={tech.icon_url} alt={tech.name} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-lg font-bold" style={{ color: tech.color }}>
                    {tech.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name / Edit */}
              {editId === tech.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ ...INPUT_STYLE, flex: 1 }}
                    autoFocus
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a96e')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                    style={{ background: 'transparent', padding: '2px' }}
                  />
                  <button type="button" onClick={() => saveEdit(tech.id)} disabled={saving} className="p-1.5 rounded" style={{ background: '#c9a96e20', color: '#c9a96e' }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button type="button" onClick={cancelEdit} className="p-1.5 rounded" style={{ background: '#ef444420', color: '#f87171' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-medium text-sm text-white">{tech.name}</span>
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: tech.color }}
                  />
                </div>
              )}

              {/* Actions */}
              {editId !== tech.id && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => triggerIconUpload(tech.id)}
                    disabled={uploadingId === tech.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                    style={{ background: '#2a2a35', color: '#9ca3af' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                    title="Upload icon"
                  >
                    {uploadingId === tech.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {tech.icon_url ? 'Replace' : 'Upload icon'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(tech)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: '#2a2a35', color: '#9ca3af' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tech.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: '#ef444415', color: '#ef4444' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#ef444430')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ef444415')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={handleIconUpload}
      />
    </div>
  );
}

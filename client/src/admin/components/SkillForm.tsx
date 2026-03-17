import { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { X, Loader2 } from 'lucide-react';
import type { Skill } from '../../types';

interface SkillFormProps {
  skill?: Skill | null;
  onSaved: () => void;
  onCancel: () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  background: '#0a0a0f',
  border: '1px solid #2a2a35',
  color: '#fff',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
};

export default function SkillForm({ skill, onSaved, onCancel }: SkillFormProps) {
  const isEdit = !!skill;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(skill?.name ?? '');
  const [category, setCategory] = useState<Skill['category']>(skill?.category ?? 'frontend');
  const [level, setLevel] = useState<1 | 2 | 3>(skill?.level ?? 2);
  const [iconName, setIconName] = useState(skill?.icon_name ?? '');
  const [isVisible, setIsVisible] = useState(skill?.is_visible ?? true);

  const focusStyle = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#c9a96e'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#2a2a35'; },
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await axios.put(`/api/admin/skills/${skill!.id}`, { name, category, level, icon_name: iconName, is_visible: isVisible });
      } else {
        await axios.post('/api/admin/skills', { name, category, level, icon_name: iconName, is_visible: isVisible });
      }
      onSaved();
    } catch (err) {
      const axErr = err as AxiosError<{ error: string }>;
      setError(axErr.response?.data?.error ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2a2a35' }}>
          <h2 className="font-syne font-bold text-white">{isEdit ? 'Edit Skill' : 'Add Skill'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Skill Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} style={INPUT_STYLE} placeholder="React" {...focusStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Skill['category'])} style={INPUT_STYLE} {...focusStyle}>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="mobile">Mobile</option>
                <option value="tools">Tools</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Level (1-3)</label>
              <select value={level} onChange={(e) => setLevel(Number(e.target.value) as 1 | 2 | 3)} style={INPUT_STYLE} {...focusStyle}>
                <option value={1}>1 — Familiar</option>
                <option value={2}>2 — Proficient</option>
                <option value={3}>3 — Expert</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Icon Name</label>
            <input value={iconName} onChange={(e) => setIconName(e.target.value)} style={INPUT_STYLE} placeholder="react, nodejs, typescript..." {...focusStyle} />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: isVisible ? '#c9a96e' : '#2a2a35' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: isVisible ? 'translateX(1.25rem)' : 'translateX(0.125rem)' }}
              />
            </button>
            <span className="text-sm" style={{ color: '#9ca3af' }}>{isVisible ? 'Visible' : 'Hidden'}</span>
          </div>
          {error && <p className="text-xs py-2 px-3 rounded-lg" style={{ background: '#ef444420', color: '#f87171' }}>{error}</p>}
          <div className="flex justify-end gap-3" style={{ borderTop: '1px solid #2a2a35', paddingTop: '1rem' }}>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ background: '#2a2a35', color: '#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#c9a96e', color: '#000', opacity: saving ? 0.7 : 1 }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';
import SkillForm from '../components/SkillForm';
import type { Skill } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  mobile: 'Mobile',
  tools: 'Tools & DevOps',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Familiar',
  2: 'Proficient',
  3: 'Expert',
};

const LEVEL_COLORS: Record<number, string> = {
  1: '#6b7280',
  2: '#60a5fa',
  3: '#c9a96e',
};

export default function SkillsPage() {
  const { data: skills, loading, refetch } = useAdminApi<Skill[]>('/api/admin/skills');
  const [formOpen, setFormOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/skills/${id}`);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const grouped: Record<string, Skill[]> = {};
  for (const skill of skills ?? []) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }

  const categories = ['frontend', 'backend', 'mobile', 'tools'].filter((c) => grouped[c]?.length > 0 || true);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: '#9ca3af' }}>{skills?.length ?? 0} skills total</p>
        <button
          onClick={() => { setEditSkill(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#c9a96e', color: '#000' }}
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin" style={{ color: '#c9a96e' }} />
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat} className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a35' }}>
              <div className="px-4 py-3" style={{ background: '#111118', borderBottom: '1px solid #2a2a35' }}>
                <h3 className="font-syne font-bold text-white text-sm">{CATEGORY_LABELS[cat] ?? cat}</h3>
              </div>
              {!grouped[cat] || grouped[cat].length === 0 ? (
                <p className="px-4 py-6 text-sm text-center" style={{ color: '#6b7280', background: '#16161d' }}>
                  No skills in this category.
                </p>
              ) : (
                <div className="divide-y" style={{ '--tw-divide-color': '#2a2a35' } as React.CSSProperties}>
                  {grouped[cat].map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between px-4 py-3"
                      style={{ background: '#16161d' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm text-white">{skill.name}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: LEVEL_COLORS[skill.level] + '20', color: LEVEL_COLORS[skill.level] }}
                        >
                          {LEVEL_LABELS[skill.level]}
                        </span>
                        {!skill.is_visible && (
                          <span className="text-xs" style={{ color: '#6b7280' }}>Hidden</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditSkill(skill); setFormOpen(true); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: '#9ca3af' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.background = '#c9a96e15'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          disabled={deletingId === skill.id}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: '#9ca3af' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#ef444415'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          {deletingId === skill.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <SkillForm
          skill={editSkill}
          onSaved={() => { setFormOpen(false); setEditSkill(null); refetch(); }}
          onCancel={() => { setFormOpen(false); setEditSkill(null); }}
        />
      )}
    </div>
  );
}

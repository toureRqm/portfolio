import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';
import ProjectForm from '../components/ProjectForm';
import type { Project } from '../../types';

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={
        status === 'in_progress'
          ? { background: '#f59e0b20', color: '#fbbf24' }
          : { background: '#22c55e20', color: '#4ade80' }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: status === 'in_progress' ? '#fbbf24' : '#4ade80' }} />
      {status === 'in_progress' ? 'In Progress' : 'Completed'}
    </span>
  );
}

export default function ProjectsPage() {
  const { data: projects, loading, refetch } = useAdminApi<Project[]>('/api/admin/projects');
  const [orderedProjects, setOrderedProjects] = useState<Project[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const dragId = useRef<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [dragAbove, setDragAbove] = useState(true); // insert above or below target

  useEffect(() => {
    if (projects) setOrderedProjects(projects);
  }, [projects]);

  /* ── Drag handlers ── */
  const onDragStart = (e: React.DragEvent, id: number) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    // Minimal ghost image
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:-200px;left:-200px;background:#c9a96e20;border:1px solid #c9a96e50;border-radius:8px;padding:8px 16px;color:#c9a96e;font-size:13px;';
    ghost.textContent = '⠿ Moving...';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 60, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const onDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id === dragId.current) { setDragOverId(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragAbove(e.clientY < rect.top + rect.height / 2);
    setDragOverId(id);
  };

  const onDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); return; }

    const list = [...orderedProjects];
    const fromIdx = list.findIndex((p) => p.id === sourceId);
    const toIdx   = list.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    // Reorder
    const [moved] = list.splice(fromIdx, 1);
    const insertAt = dragAbove ? (fromIdx < toIdx ? toIdx - 1 : toIdx) : (fromIdx < toIdx ? toIdx : toIdx + 1);
    list.splice(insertAt, 0, moved);

    setOrderedProjects(list);
    setDragOverId(null);
    dragId.current = null;

    // Persist
    setSaving(true);
    try {
      await axios.put('/api/admin/projects/reorder', { ids: list.map((p) => p.id) });
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = () => { dragId.current = null; setDragOverId(null); };

  /* ── CRUD ── */
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/projects/${id}`);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (project: Project) => {
    await axios.put(`/api/admin/projects/${project.id}`, { ...project, is_visible: !project.is_visible });
    refetch();
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditProject(null);
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm" style={{ color: '#9ca3af' }}>{orderedProjects.length} projects total</p>
          {saving && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#c9a96e' }}>
              <Loader2 size={12} className="animate-spin" /> Saving order...
            </span>
          )}
        </div>
        <button
          onClick={() => { setEditProject(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#c9a96e', color: '#000' }}
        >
          <Plus size={16} />
          New Project
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
                <th className="px-3 py-3 w-8" />
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Project</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Status</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Visible</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Technologies</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderedProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center" style={{ color: '#6b7280' }}>
                    No projects yet. Click "New Project" to create one.
                  </td>
                </tr>
              )}
              {orderedProjects.map((project, i) => {
                const isDraggingOver = dragOverId === project.id;
                const isDragging = dragId.current === project.id;
                return (
                  <tr
                    key={project.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, project.id)}
                    onDragOver={(e) => onDragOver(e, project.id)}
                    onDrop={(e) => onDrop(e, project.id)}
                    onDragEnd={onDragEnd}
                    style={{
                      background: isDragging ? '#c9a96e08' : i % 2 === 0 ? '#16161d' : '#111118',
                      borderBottom: '1px solid #2a2a35',
                      borderTop: isDraggingOver && dragAbove ? '2px solid #c9a96e' : undefined,
                      borderBottomColor: isDraggingOver && !dragAbove ? '#c9a96e' : '#2a2a35',
                      opacity: isDragging ? 0.45 : 1,
                      transition: 'opacity 0.15s, border-color 0.1s',
                    }}
                  >
                    {/* Drag handle */}
                    <td className="px-3 py-3 w-8">
                      <div
                        className="flex items-center justify-center cursor-grab active:cursor-grabbing rounded"
                        style={{ color: '#3a3a4a', width: 20, height: 20 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#c9a96e60'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#3a3a4a'; }}
                      >
                        <GripVertical size={14} />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {project.cover_image && (
                          <img src={project.cover_image} alt="" className="w-10 h-7 rounded object-cover flex-shrink-0" style={{ border: '1px solid #2a2a35' }} />
                        )}
                        <span className="font-medium text-white">{project.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleVisible(project)}
                        className="transition-colors"
                        style={{ color: project.is_visible ? '#4ade80' : '#6b7280' }}
                        title={project.is_visible ? 'Click to hide' : 'Click to show'}
                      >
                        {project.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech.id} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#2a2a35', color: '#9ca3af' }}>
                            {tech.name}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#2a2a35', color: '#6b7280' }}>
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditProject(project); setFormOpen(true); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: '#9ca3af' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.background = '#c9a96e15'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={deletingId === project.id}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: '#9ca3af' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#ef444415'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                          title="Delete"
                        >
                          {deletingId === project.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <ProjectForm
          project={editProject}
          onSaved={handleSaved}
          onCancel={() => { setFormOpen(false); setEditProject(null); }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
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
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: status === 'in_progress' ? '#fbbf24' : '#4ade80' }}
      />
      {status === 'in_progress' ? 'In Progress' : 'Completed'}
    </span>
  );
}

export default function ProjectsPage() {
  const { data: projects, loading, refetch } = useAdminApi<Project[]>('/api/admin/projects');
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
        <p className="text-sm" style={{ color: '#9ca3af' }}>{projects?.length ?? 0} projects total</p>
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
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Project</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Status</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Visible</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Technologies</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ color: '#6b7280' }}>
                    No projects yet. Click "New Project" to create one.
                  </td>
                </tr>
              )}
              {projects?.map((project, i) => (
                <tr
                  key={project.id}
                  style={{
                    background: i % 2 === 0 ? '#16161d' : '#111118',
                    borderBottom: '1px solid #2a2a35',
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {project.cover_image && (
                        <img
                          src={project.cover_image}
                          alt=""
                          className="w-10 h-7 rounded object-cover flex-shrink-0"
                          style={{ border: '1px solid #2a2a35' }}
                        />
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
                        <span
                          key={tech.id}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: '#2a2a35', color: '#9ca3af' }}
                        >
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
              ))}
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

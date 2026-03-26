import { useState, FormEvent, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { X, Loader2, Upload, ImagePlus } from 'lucide-react';
import type { Project, ProjectImage, Technology } from '../../types';
import TechPicker from './TechPicker';

interface ProjectFormProps {
  project?: Project | null;
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

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#9ca3af',
  marginBottom: '0.375rem',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

export default function ProjectForm({ project, onSaved, onCancel }: ProjectFormProps) {
  const isEdit = !!project;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(project?.title ?? '');
  const [titleFr, setTitleFr] = useState(project?.title_fr ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [descriptionFr, setDescriptionFr] = useState(project?.description_fr ?? '');
  const [role, setRole] = useState(project?.role ?? '');
  const [roleFr, setRoleFr] = useState(project?.role_fr ?? '');
  const [context, setContext] = useState(project?.context ?? '');
  const [contextFr, setContextFr] = useState(project?.context_fr ?? '');
  const [dateStart, setDateStart] = useState(project?.date_start?.slice(0, 10) ?? '');
  const [dateEnd, setDateEnd] = useState(project?.date_end?.slice(0, 10) ?? '');
  const [status, setStatus] = useState<'completed' | 'in_progress'>(project?.status ?? 'completed');
  const [demoUrl, setDemoUrl] = useState(project?.demo_url ?? '');
  const [githubUrl, setGithubUrl] = useState(project?.github_url ?? '');
  const [otherUrl, setOtherUrl] = useState(project?.other_url ?? '');
  const [otherUrlLabel, setOtherUrlLabel] = useState(project?.other_url_label ?? '');
  const [coverImage, setCoverImage] = useState(project?.cover_image ?? '');
  const [isVisible, setIsVisible] = useState(project?.is_visible ?? true);
  const [technologies, setTechnologies] = useState<Technology[]>(project?.technologies ?? []);

  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>(project?.images ?? []);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (file: File) => {
    if (!isEdit) { setError('Save the project first, then upload images.'); return; }
    setCoverUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('cover', file);
      const { data } = await axios.post<{ url: string }>(
        `/api/admin/projects/${project!.id}/cover`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setCoverImage(data.url);
    } catch {
      setError('Cover upload failed.');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!isEdit) return;
    setGalleryUploading(true);
    setError('');
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const { data } = await axios.post<ProjectImage[]>(
        `/api/admin/projects/${project!.id}/images`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setGalleryImages((prev) => [...prev, ...data]);
    } catch {
      setError('Gallery upload failed.');
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId: number) => {
    try {
      await axios.delete(`/api/admin/projects/${project!.id}/images/${imageId}`);
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError('Failed to delete image.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      title, title_fr: titleFr || null, description, description_fr: descriptionFr || null,
      cover_image: coverImage || null, role, role_fr: roleFr || null,
      context, context_fr: contextFr || null,
      date_start: dateStart || null, date_end: dateEnd || null,
      status, demo_url: demoUrl || null, github_url: githubUrl || null,
      other_url: otherUrl || null, other_url_label: otherUrlLabel || null,
      is_visible: isVisible,
      technologies: technologies.map((t) => ({ id: t.id || undefined, name: t.name, color: t.color })),
    };
    try {
      if (isEdit) {
        await axios.put(`/api/admin/projects/${project!.id}`, payload);
      } else {
        await axios.post('/api/admin/projects', payload);
      }
      onSaved();
    } catch (err) {
      const axErr = err as AxiosError<{ error: string }>;
      setError(axErr.response?.data?.error ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputProps = (value: string, onChange: (v: string) => void, placeholder = '') => ({
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value),
    placeholder,
    style: INPUT_STYLE,
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#c9a96e'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#2a2a35'; },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <div className="w-full max-w-3xl rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #2a2a35' }}>
          <h2 className="font-syne font-bold text-white text-lg">{isEdit ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title (EN) *"><input required {...inputProps(title, setTitle, 'Project title')} /></Field>
            <Field label="Title (FR)"><input {...inputProps(titleFr, setTitleFr, 'Titre du projet')} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Description (EN) *">
              <textarea required rows={4} {...inputProps(description, setDescription, 'Project description...')} style={{ ...INPUT_STYLE, resize: 'vertical' }} />
            </Field>
            <Field label="Description (FR)">
              <textarea rows={4} {...inputProps(descriptionFr, setDescriptionFr, 'Description du projet...')} style={{ ...INPUT_STYLE, resize: 'vertical' }} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role (EN) *"><input required {...inputProps(role, setRole, 'Full Stack Developer')} /></Field>
            <Field label="Role (FR)"><input {...inputProps(roleFr, setRoleFr, 'Développeur Full Stack')} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Context (EN)"><input {...inputProps(context, setContext, 'Freelance / Company / Personal')} /></Field>
            <Field label="Context (FR)"><input {...inputProps(contextFr, setContextFr, 'Freelance / Entreprise / Personnel')} /></Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Date Start"><input type="date" {...inputProps(dateStart, setDateStart)} /></Field>
            <Field label="Date End"><input type="date" {...inputProps(dateEnd, setDateEnd)} /></Field>
            <Field label="Status">
              <select {...inputProps(status, (v) => setStatus(v as 'completed' | 'in_progress'))}>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </Field>
          </div>

          {/* Cover Image */}
          <div>
            <label style={LABEL_STYLE}>Cover Image <span style={{ color: '#4b5563' }}>(thumbnail shown in project grid)</span></label>
            <div className="flex gap-2">
              <input {...inputProps(coverImage, setCoverImage, '/uploads/filename.jpg or external URL')} />
              {isEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm flex-shrink-0"
                    style={{ background: '#2a2a35', color: '#9ca3af', border: '1px solid #3a3a45' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    {coverUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ''; }} />
                </>
              )}
            </div>
            {coverImage && (
              <img src={coverImage} alt="Cover preview" className="mt-2 h-24 rounded-lg object-cover"
                style={{ border: '1px solid #2a2a35' }} />
            )}
            {!isEdit && (
              <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
                Create the project first, then upload images in edit mode.
              </p>
            )}
          </div>

          {/* Gallery Images */}
          {isEdit && (
            <div>
              <label style={LABEL_STYLE}>
                Gallery Images <span style={{ color: '#4b5563' }}>(carousel in project popup — hover to delete)</span>
              </label>
              {galleryImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.image_url} alt="" className="w-20 h-16 rounded-lg object-cover"
                        style={{ border: '1px solid #2a2a35' }} />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: '#ef4444', color: '#fff' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm w-full justify-center transition-colors"
                style={{ background: '#0a0a0f', border: '1px dashed #3a3a45', color: '#6b7280' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c9a96e60'; (e.currentTarget as HTMLButtonElement).style.color = '#c9a96e'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a45'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; }}
              >
                {galleryUploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                {galleryUploading ? 'Uploading...' : 'Add gallery images'}
              </button>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { if (e.target.files?.length) handleGalleryUpload(e.target.files); e.target.value = ''; }} />
            </div>
          )}

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Demo URL"><input type="url" {...inputProps(demoUrl, setDemoUrl, 'https://...')} /></Field>
            <Field label="GitHub URL"><input type="url" {...inputProps(githubUrl, setGithubUrl, 'https://github.com/...')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Other URL"><input type="url" {...inputProps(otherUrl, setOtherUrl, 'https://...')} /></Field>
            <Field label="Other URL Label"><input {...inputProps(otherUrlLabel, setOtherUrlLabel, 'View Case Study')} /></Field>
          </div>

          {/* Technologies */}
          <Field label="Technologies">
            <TechPicker selected={technologies} onChange={setTechnologies} />
          </Field>

          {/* Visible toggle */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsVisible(!isVisible)} className="relative w-10 h-5 rounded-full transition-colors" style={{ background: isVisible ? '#c9a96e' : '#2a2a35' }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: isVisible ? 'translateX(1.25rem)' : 'translateX(0.125rem)' }} />
            </button>
            <span className="text-sm" style={{ color: '#9ca3af' }}>{isVisible ? 'Visible on portfolio' : 'Hidden (draft)'}</span>
          </div>

          {error && (
            <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#ef444420', color: '#f87171' }}>{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid #2a2a35', paddingTop: '1rem' }}>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ background: '#2a2a35', color: '#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity" style={{ background: '#c9a96e', color: '#000', opacity: saving ? 0.7 : 1 }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

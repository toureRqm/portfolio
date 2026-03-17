import { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Experience, Technology } from '../../types';

interface ExperienceFormProps {
  experience?: Experience | null;
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

const focusStyle = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#c9a96e'; },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#2a2a35'; },
};

export default function ExperienceForm({ experience, onSaved, onCancel }: ExperienceFormProps) {
  const isEdit = !!experience;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [jobTitle, setJobTitle] = useState(experience?.job_title ?? '');
  const [jobTitleFr, setJobTitleFr] = useState(experience?.job_title_fr ?? '');
  const [company, setCompany] = useState(experience?.company ?? '');
  const [dateStart, setDateStart] = useState(experience?.date_start?.slice(0, 10) ?? '');
  const [dateEnd, setDateEnd] = useState(experience?.date_end?.slice(0, 10) ?? '');
  const [location, setLocation] = useState(experience?.location ?? '');
  const [workType, setWorkType] = useState<'remote' | 'on-site' | 'hybrid'>(experience?.work_type ?? 'on-site');
  const [description, setDescription] = useState(experience?.description ?? '');
  const [descriptionFr, setDescriptionFr] = useState(experience?.description_fr ?? '');
  const [isVisible, setIsVisible] = useState(experience?.is_visible ?? true);
  const [technologies, setTechnologies] = useState<Technology[]>(experience?.technologies ?? []);
  const [techInput, setTechInput] = useState('');

  const addTech = () => {
    const name = techInput.trim();
    if (!name) return;
    if (technologies.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setTechInput('');
      return;
    }
    setTechnologies([...technologies, { id: 0, name, color: '#888888' }]);
    setTechInput('');
  };

  const removeTech = (name: string) => {
    setTechnologies(technologies.filter((t) => t.name !== name));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      job_title: jobTitle, job_title_fr: jobTitleFr || null,
      company, date_start: dateStart, date_end: dateEnd || null,
      location, work_type: workType,
      description, description_fr: descriptionFr || null,
      is_visible: isVisible,
      technologies: technologies.map((t) => ({ id: t.id || undefined, name: t.name, color: t.color })),
    };
    try {
      if (isEdit) {
        await axios.put(`/api/admin/experiences/${experience!.id}`, payload);
      } else {
        await axios.post('/api/admin/experiences', payload);
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-full max-w-2xl rounded-xl"
        style={{ background: '#16161d', border: '1px solid #2a2a35' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #2a2a35' }}>
          <h2 className="font-syne font-bold text-white text-lg">
            {isEdit ? 'Edit Experience' : 'New Experience'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Job Title (EN) *">
              <input required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={INPUT_STYLE} placeholder="Software Engineer" {...focusStyle} />
            </Field>
            <Field label="Job Title (FR)">
              <input value={jobTitleFr} onChange={(e) => setJobTitleFr(e.target.value)} style={INPUT_STYLE} placeholder="Ingénieur Logiciel" {...focusStyle} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Company *">
              <input required value={company} onChange={(e) => setCompany(e.target.value)} style={INPUT_STYLE} placeholder="Acme Corp" {...focusStyle} />
            </Field>
            <Field label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} style={INPUT_STYLE} placeholder="Paris, France" {...focusStyle} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Date Start *">
              <input required type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} style={INPUT_STYLE} {...focusStyle} />
            </Field>
            <Field label="Date End (blank = Present)">
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} style={INPUT_STYLE} {...focusStyle} />
            </Field>
            <Field label="Work Type">
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as 'remote' | 'on-site' | 'hybrid')}
                style={INPUT_STYLE}
                {...focusStyle}
              >
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Description (EN) *">
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...INPUT_STYLE, resize: 'vertical' }}
                placeholder="• Built feature X&#10;• Improved performance by Y%"
                {...focusStyle}
              />
            </Field>
            <Field label="Description (FR)">
              <textarea
                rows={5}
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
                style={{ ...INPUT_STYLE, resize: 'vertical' }}
                placeholder="• Développé la fonctionnalité X&#10;• Amélioré les performances de Y%"
                {...focusStyle}
              />
            </Field>
          </div>

          <Field label="Technologies">
            <div className="flex gap-2 mb-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                placeholder="React, Node.js..."
                style={INPUT_STYLE}
                {...focusStyle}
              />
              <button type="button" onClick={addTech} className="px-3 py-2 rounded-lg flex-shrink-0" style={{ background: '#c9a96e', color: '#000' }}>
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span key={tech.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: '#2a2a35', color: '#e5e7eb' }}>
                  {tech.name}
                  <button type="button" onClick={() => removeTech(tech.name)} className="hover:text-red-400 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </Field>

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
            <span className="text-sm" style={{ color: '#9ca3af' }}>
              {isVisible ? 'Visible on portfolio' : 'Hidden'}
            </span>
          </div>

          {error && (
            <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#ef444420', color: '#f87171' }}>{error}</p>
          )}

          <div className="flex justify-end gap-3" style={{ borderTop: '1px solid #2a2a35', paddingTop: '1rem' }}>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ background: '#2a2a35', color: '#9ca3af' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#c9a96e', color: '#000', opacity: saving ? 0.7 : 1 }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

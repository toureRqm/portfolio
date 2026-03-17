import { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { Loader2, Save } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';
import type { Profile } from '../../types';

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

const focusStyle = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#c9a96e'; },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#2a2a35'; },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, loading, refetch } = useAdminApi<Profile>('/api/admin/profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleFr, setSubtitleFr] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [aboutTextFr, setAboutTextFr] = useState('');
  const [yearsExp, setYearsExp] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setTitle(profile.title ?? '');
    setTitleFr(profile.title_fr ?? '');
    setSubtitle(profile.subtitle ?? '');
    setSubtitleFr(profile.subtitle_fr ?? '');
    setAboutText(profile.about_text ?? '');
    setAboutTextFr(profile.about_text_fr ?? '');
    setYearsExp(profile.years_experience ?? 0);
    setProjectsCount(profile.projects_count ?? 0);
    setEmail(profile.email ?? '');
    setLinkedin(profile.linkedin_url ?? '');
    setGithub(profile.github_url ?? '');
    setTwitter(profile.twitter_url ?? '');
    setPhotoUrl(profile.photo_url ?? '');
    setCvUrl(profile.cv_url ?? '');
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await axios.put('/api/admin/profile', {
        name, title, title_fr: titleFr || null, subtitle, subtitle_fr: subtitleFr || null,
        about_text: aboutText, about_text_fr: aboutTextFr || null,
        years_experience: yearsExp, projects_count: projectsCount,
        email, linkedin_url: linkedin || null, github_url: github || null, twitter_url: twitter || null,
      });
      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const axErr = err as AxiosError<{ error: string }>;
      setError(axErr.response?.data?.error ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await axios.post<{ url: string }>('/api/admin/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoUrl(data.url);
      refetch();
    } catch {
      setError('Photo upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const uploadCv = async (file: File) => {
    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const { data } = await axios.post<{ url: string }>('/api/admin/profile/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCvUrl(data.url);
      refetch();
    } catch {
      setError('CV upload failed');
    } finally {
      setCvUploading(false);
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
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* Photo + CV uploads */}
      <div className="grid grid-cols-2 gap-6 p-6 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div>
          <p className="text-sm font-medium text-white mb-3">Profile Photo</p>
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a35' }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: '#6b7280' }}>?</div>
              )}
            </div>
            <label
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
              style={{ background: '#2a2a35', color: '#9ca3af', border: '1px solid #3a3a45' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              {photoUploading ? <Loader2 size={14} className="animate-spin" /> : null}
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-white mb-3">CV (PDF)</p>
          <div className="flex items-center gap-4">
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: '#c9a96e' }}>
                View current CV
              </a>
            )}
            <label
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
              style={{ background: '#2a2a35', color: '#9ca3af', border: '1px solid #3a3a45' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              {cvUploading ? <Loader2 size={14} className="animate-spin" /> : null}
              Upload CV PDF
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCv(f); }} />
            </label>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="p-6 rounded-xl space-y-4" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <h3 className="font-syne font-bold text-white">Basic Information</h3>
        <Field label="Full Name">
          <input value={name} onChange={(e) => setName(e.target.value)} style={INPUT_STYLE} placeholder="Abdourahmane Touré" {...focusStyle} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title (EN)">
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} placeholder="Full Stack Developer" {...focusStyle} />
          </Field>
          <Field label="Title (FR)">
            <input value={titleFr} onChange={(e) => setTitleFr(e.target.value)} style={INPUT_STYLE} placeholder="Développeur Full Stack" {...focusStyle} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Subtitle (EN)">
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={INPUT_STYLE} placeholder="Building modern web apps" {...focusStyle} />
          </Field>
          <Field label="Subtitle (FR)">
            <input value={subtitleFr} onChange={(e) => setSubtitleFr(e.target.value)} style={INPUT_STYLE} placeholder="Développement d'apps web modernes" {...focusStyle} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Years of Experience">
            <input type="number" min={0} value={yearsExp} onChange={(e) => setYearsExp(Number(e.target.value))} style={INPUT_STYLE} {...focusStyle} />
          </Field>
          <Field label="Projects Count">
            <input type="number" min={0} value={projectsCount} onChange={(e) => setProjectsCount(Number(e.target.value))} style={INPUT_STYLE} {...focusStyle} />
          </Field>
        </div>
      </div>

      {/* About */}
      <div className="p-6 rounded-xl space-y-4" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <h3 className="font-syne font-bold text-white">About Text</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="About (EN)">
            <textarea rows={6} value={aboutText} onChange={(e) => setAboutText(e.target.value)} style={{ ...INPUT_STYLE, resize: 'vertical' }} placeholder="About text (separate paragraphs with blank lines)" {...focusStyle} />
          </Field>
          <Field label="About (FR)">
            <textarea rows={6} value={aboutTextFr} onChange={(e) => setAboutTextFr(e.target.value)} style={{ ...INPUT_STYLE, resize: 'vertical' }} placeholder="À propos (paragraphes séparés par des lignes vides)" {...focusStyle} />
          </Field>
        </div>
      </div>

      {/* Contact */}
      <div className="p-6 rounded-xl space-y-4" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <h3 className="font-syne font-bold text-white">Contact & Social</h3>
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={INPUT_STYLE} placeholder="hello@example.com" {...focusStyle} />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="LinkedIn URL">
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={INPUT_STYLE} placeholder="https://linkedin.com/in/..." {...focusStyle} />
          </Field>
          <Field label="GitHub URL">
            <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} style={INPUT_STYLE} placeholder="https://github.com/..." {...focusStyle} />
          </Field>
          <Field label="Twitter/X URL">
            <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} style={INPUT_STYLE} placeholder="https://twitter.com/..." {...focusStyle} />
          </Field>
        </div>
      </div>

      {error && <p className="py-2 px-3 rounded-lg text-sm" style={{ background: '#ef444420', color: '#f87171' }}>{error}</p>}
      {success && <p className="py-2 px-3 rounded-lg text-sm" style={{ background: '#22c55e20', color: '#4ade80' }}>Profile saved successfully.</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-opacity"
          style={{ background: '#c9a96e', color: '#000', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

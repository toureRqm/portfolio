import { useState, useEffect, useRef, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { Loader2, Shield, Lock, FileText, ImagePlus, Trash2, Palette } from 'lucide-react';
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
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#c9a96e'; },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#2a2a35'; },
};

export default function SettingsPage() {
  const { data: profile, refetch } = useAdminApi<Profile>('/api/admin/profile');

  // Branding
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  const [maintMsgEn, setMaintMsgEn] = useState('');
  const [maintMsgFr, setMaintMsgFr] = useState('');
  const [maintMsgSaving, setMaintMsgSaving] = useState(false);
  const [maintMsgSuccess, setMaintMsgSuccess] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logo_url);
      setFaviconUrl(profile.favicon_url);
      setMaintenance(profile.maintenance_mode);
      setMaintMsgEn(profile.maintenance_message ?? '');
      setMaintMsgFr(profile.maintenance_message_fr ?? '');
    }
  }, [profile]);

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const { data } = await axios.post<{ url: string }>('/api/admin/profile/logo', fd);
      setLogoUrl(data.url);
      refetch();
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    await axios.delete('/api/admin/profile/logo');
    setLogoUrl(null);
    refetch();
  };

  const handleFaviconUpload = async (file: File) => {
    setFaviconUploading(true);
    const fd = new FormData();
    fd.append('favicon', file);
    try {
      const { data } = await axios.post<{ url: string }>('/api/admin/profile/favicon', fd);
      setFaviconUrl(data.url);
      refetch();
    } finally {
      setFaviconUploading(false);
    }
  };

  const handleFaviconDelete = async () => {
    await axios.delete('/api/admin/profile/favicon');
    setFaviconUrl(null);
    refetch();
  };

  const handleSaveMaintContent = async (e: FormEvent) => {
    e.preventDefault();
    setMaintMsgSaving(true);
    try {
      await axios.put('/api/admin/settings/maintenance-content', {
        maintenance_message: maintMsgEn,
        maintenance_message_fr: maintMsgFr,
      });
      setMaintMsgSuccess(true);
      refetch();
      setTimeout(() => setMaintMsgSuccess(false), 3000);
    } finally {
      setMaintMsgSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setMaintenanceSaving(true);
    try {
      await axios.put('/api/admin/settings/maintenance', { maintenance_mode: !maintenance });
      setMaintenance(!maintenance);
      refetch();
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await axios.put('/api/admin/settings/password', { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      const axErr = err as AxiosError<{ error: string }>;
      setPwError(axErr.response?.data?.error ?? 'Password change failed');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">

      {/* Branding */}
      <div className="p-6 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#c9a96e20' }}>
            <Palette size={18} style={{ color: '#c9a96e' }} />
          </div>
          <h3 className="font-syne font-bold text-white">Branding</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Logo */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>Logo (navbar)</p>
            <div
              className="relative rounded-lg overflow-hidden flex items-center justify-center mb-2"
              style={{ height: '80px', background: '#0a0a0f', border: '1px solid #2a2a35' }}
            >
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                  <button
                    onClick={handleLogoDelete}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-opacity"
                    style={{ background: '#ef444490' }}
                    title="Remove logo"
                  >
                    <Trash2 size={11} style={{ color: '#fff' }} />
                  </button>
                </>
              ) : (
                <span className="text-xs" style={{ color: '#4b5563' }}>No logo — uses name</span>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-opacity"
              style={{ background: '#c9a96e20', color: '#c9a96e', border: '1px solid #c9a96e40', opacity: logoUploading ? 0.6 : 1 }}
            >
              {logoUploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              {logoUrl ? 'Replace' : 'Upload logo'}
            </button>
          </div>

          {/* Favicon */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>Favicon (browser tab)</p>
            <div
              className="relative rounded-lg overflow-hidden flex items-center justify-center mb-2"
              style={{ height: '80px', background: '#0a0a0f', border: '1px solid #2a2a35' }}
            >
              {faviconUrl ? (
                <>
                  <img src={faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                  <button
                    onClick={handleFaviconDelete}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-opacity"
                    style={{ background: '#ef444490' }}
                    title="Remove favicon"
                  >
                    <Trash2 size={11} style={{ color: '#fff' }} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <img src="/favicon.svg" alt="Default favicon" className="w-8 h-8" />
                  <span className="text-xs" style={{ color: '#4b5563' }}>Default</span>
                </div>
              )}
            </div>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*,.ico,.svg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFaviconUpload(e.target.files[0])}
            />
            <button
              onClick={() => faviconInputRef.current?.click()}
              disabled={faviconUploading}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-opacity"
              style={{ background: '#c9a96e20', color: '#c9a96e', border: '1px solid #c9a96e40', opacity: faviconUploading ? 0.6 : 1 }}
            >
              {faviconUploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              {faviconUrl ? 'Replace' : 'Upload favicon'}
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="p-6 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#c9a96e20' }}>
            <Shield size={18} style={{ color: '#c9a96e' }} />
          </div>
          <h3 className="font-syne font-bold text-white">Maintenance Mode</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
          When enabled, visitors will see a maintenance page. Admins can still access the portfolio.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: maintenance ? '#4ade80' : '#9ca3af' }}>
            {maintenance ? 'Maintenance mode is ON' : 'Maintenance mode is OFF'}
          </span>
          <button
            onClick={handleToggleMaintenance}
            disabled={maintenanceSaving}
            className="relative w-12 h-6 rounded-full transition-colors flex items-center"
            style={{ background: maintenance ? '#c9a96e' : '#2a2a35' }}
          >
            {maintenanceSaving ? (
              <Loader2 size={12} className="animate-spin mx-auto" style={{ color: '#fff' }} />
            ) : (
              <span
                className="absolute w-5 h-5 rounded-full bg-white transition-transform shadow"
                style={{ transform: maintenance ? 'translateX(1.5rem)' : 'translateX(0.125rem)' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Maintenance Page Content */}
      <div className="p-6 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#a78bfa20' }}>
            <FileText size={18} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h3 className="font-syne font-bold text-white">Maintenance Page Content</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Leave empty to use the default message</p>
          </div>
        </div>

        <form onSubmit={handleSaveMaintContent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
              Message — English
            </label>
            <textarea
              rows={3}
              value={maintMsgEn}
              onChange={(e) => setMaintMsgEn(e.target.value)}
              placeholder="My portfolio is currently <strong>under construction</strong>."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a35', color: '#fff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a96e')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
            />
            <p className="text-xs mt-1" style={{ color: '#4b5563' }}>HTML tags are supported: &lt;strong&gt;, &lt;br/&gt;</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
              Message — Français
            </label>
            <textarea
              rows={3}
              value={maintMsgFr}
              onChange={(e) => setMaintMsgFr(e.target.value)}
              placeholder="Mon portfolio est actuellement <strong>en cours de construction</strong>."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a35', color: '#fff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a96e')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
            />
          </div>

          {maintMsgSuccess && (
            <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#22c55e20', color: '#4ade80' }}>
              Content saved successfully.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={maintMsgSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-opacity"
              style={{ background: '#a78bfa', color: '#000', opacity: maintMsgSaving ? 0.7 : 1 }}
            >
              {maintMsgSaving && <Loader2 size={14} className="animate-spin" />}
              Save Content
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#60a5fa20' }}>
            <Lock size={18} style={{ color: '#60a5fa' }} />
          </div>
          <h3 className="font-syne font-bold text-white">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Current Password</label>
            <input
              type="password"
              required
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              style={INPUT_STYLE}
              placeholder="••••••••"
              {...focusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>New Password</label>
            <input
              type="password"
              required
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              style={INPUT_STYLE}
              placeholder="••••••••"
              {...focusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              style={INPUT_STYLE}
              placeholder="••••••••"
              {...focusStyle}
            />
          </div>

          {pwError && (
            <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#ef444420', color: '#f87171' }}>{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#22c55e20', color: '#4ade80' }}>Password changed successfully.</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-opacity"
              style={{ background: '#c9a96e', color: '#000', opacity: pwSaving ? 0.7 : 1 }}
            >
              {pwSaving && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

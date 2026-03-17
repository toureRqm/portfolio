import { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { Loader2, Shield, Lock } from 'lucide-react';
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
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (profile) setMaintenance(profile.maintenance_mode);
  }, [profile]);

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

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div
        className="w-full max-w-sm p-8 rounded-xl"
        style={{ background: '#16161d', border: '1px solid #2a2a35' }}
      >
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ background: '#c9a96e20', border: '1px solid #c9a96e40' }}
          >
            <span style={{ color: '#c9a96e', fontSize: '1.2rem', fontWeight: 700 }}>A</span>
          </div>
          <h1 className="font-syne font-bold text-2xl text-white mb-1">Admin Panel</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-colors"
              style={{
                background: '#0a0a0f',
                border: '1px solid #2a2a35',
                color: '#fff',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a96e')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-colors"
              style={{
                background: '#0a0a0f',
                border: '1px solid #2a2a35',
                color: '#fff',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a96e')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs py-2 px-3 rounded-lg" style={{ background: '#ef444420', color: '#f87171' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-opacity"
            style={{ background: '#c9a96e', color: '#000', opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Briefcase,
  Cpu,
  MessageSquare,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/profile', label: 'Profile', icon: User },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { to: '/admin/experiences', label: 'Experiences', icon: Briefcase },
  { to: '/admin/technologies', label: 'Technologies', icon: Layers },
  { to: '/admin/skills', label: 'Skills', icon: Cpu },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-30"
      style={{ background: '#111118', borderRight: '1px solid #2a2a35' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #2a2a35' }}>
        <span className="font-syne font-bold text-lg" style={{ color: '#c9a96e' }}>
          Portfolio
        </span>
        <span className="block text-xs mt-0.5" style={{ color: '#6b7280' }}>
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'hover:text-white'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? '#c9a96e18' : 'transparent',
              color: isActive ? '#c9a96e' : '#9ca3af',
              border: isActive ? '1px solid #c9a96e30' : '1px solid transparent',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #2a2a35' }}>
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-white truncate">{admin?.name ?? 'Admin'}</p>
          <p className="text-xs truncate" style={{ color: '#6b7280' }}>{admin?.email ?? ''}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444410'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

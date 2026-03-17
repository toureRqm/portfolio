import { useLocation, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/profile': 'Profile',
  '/admin/projects': 'Projects',
  '/admin/experiences': 'Experiences',
  '/admin/skills': 'Skills',
  '/admin/messages': 'Messages',
  '/admin/settings': 'Settings',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Admin';

  return (
    <header
      className="h-14 flex items-center justify-between px-6"
      style={{ background: '#111118', borderBottom: '1px solid #2a2a35' }}
    >
      <h1 className="font-syne font-bold text-white text-lg">{title}</h1>
      <Link
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm transition-colors"
        style={{ color: '#9ca3af' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a96e')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
      >
        <ExternalLink size={14} />
        View Portfolio
      </Link>
    </header>
  );
}

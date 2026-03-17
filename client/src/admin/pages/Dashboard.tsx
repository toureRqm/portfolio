import { FolderOpen, Briefcase, Cpu, MessageSquare } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';
import type { Project, Experience, Skill } from '../../types';

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20', border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-syne font-bold text-white">{value}</p>
        <p className="text-sm" style={{ color: '#9ca3af' }}>{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: projects } = useAdminApi<Project[]>('/api/admin/projects');
  const { data: experiences } = useAdminApi<Experience[]>('/api/admin/experiences');
  const { data: skills } = useAdminApi<Skill[]>('/api/admin/skills');
  const { data: messages } = useAdminApi<Message[]>('/api/admin/messages');

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;
  const recentMessages = messages?.slice(0, 5) ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderOpen} label="Projects" value={projects?.length ?? 0} color="#c9a96e" />
        <StatCard icon={Briefcase} label="Experiences" value={experiences?.length ?? 0} color="#60a5fa" />
        <StatCard icon={Cpu} label="Skills" value={skills?.length ?? 0} color="#34d399" />
        <StatCard icon={MessageSquare} label="Unread Messages" value={unreadCount} color="#f472b6" />
      </div>

      {/* Recent Messages */}
      <div className="rounded-xl" style={{ background: '#16161d', border: '1px solid #2a2a35' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2a35' }}>
          <h2 className="font-syne font-bold text-white">Recent Messages</h2>
        </div>
        {recentMessages.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: '#6b7280' }}>No messages yet.</p>
        ) : (
          <div className="divide-y" style={{ '--tw-divide-color': '#2a2a35' } as React.CSSProperties}>
            {recentMessages.map((msg) => (
              <div key={msg.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#c9a96e' }} />
                    )}
                    <span className="font-medium text-sm text-white truncate">{msg.sender_name}</span>
                    <span className="text-xs truncate" style={{ color: '#6b7280' }}>{msg.sender_email}</span>
                  </div>
                  <p className="text-sm truncate" style={{ color: '#9ca3af' }}>{msg.message}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#6b7280' }}>{formatDate(msg.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

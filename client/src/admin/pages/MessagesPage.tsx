import { useState } from 'react';
import axios from 'axios';
import { Mail, MailOpen, Trash2, Loader2, X } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const { data: messages, loading, refetch } = useAdminApi<Message[]>('/api/admin/messages');
  const [selected, setSelected] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleToggleRead = async (msg: Message) => {
    await axios.put(`/api/admin/messages/${msg.id}/read`, { is_read: !msg.is_read });
    if (selected?.id === msg.id) setSelected({ ...msg, is_read: !msg.is_read });
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/messages/${id}`);
      if (selected?.id === id) setSelected(null);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (!msg.is_read) {
      await axios.put(`/api/admin/messages/${msg.id}/read`, { is_read: true });
      refetch();
    }
  };

  return (
    <div>
      <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
        {messages?.filter((m) => !m.is_read).length ?? 0} unread · {messages?.length ?? 0} total
      </p>

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
                <th className="w-6 px-4 py-3" />
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>From</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell" style={{ color: '#9ca3af' }}>Preview</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: '#9ca3af' }}>Date</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ color: '#6b7280' }}>
                    No messages yet.
                  </td>
                </tr>
              )}
              {messages?.map((msg, i) => (
                <tr
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className="cursor-pointer"
                  style={{
                    background: i % 2 === 0 ? '#16161d' : '#111118',
                    borderBottom: '1px solid #2a2a35',
                    fontWeight: msg.is_read ? 400 : 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e1e26')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#16161d' : '#111118')}
                >
                  <td className="px-4 py-3">
                    <span style={{ color: msg.is_read ? '#6b7280' : '#c9a96e' }}>
                      {msg.is_read ? <MailOpen size={14} /> : <Mail size={14} />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white block">{msg.sender_name}</span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>{msg.sender_email}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: '#9ca3af' }}>
                    <span className="truncate block max-w-xs">{msg.message.substring(0, 80)}{msg.message.length > 80 ? '…' : ''}</span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#9ca3af' }}>
                    {formatDate(msg.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleRead(msg)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = '#60a5fa15'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {msg.is_read ? <Mail size={14} /> : <MailOpen size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#ef444415'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        title="Delete"
                      >
                        {deletingId === msg.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl"
            style={{ background: '#16161d', border: '1px solid #2a2a35' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: '1px solid #2a2a35' }}>
              <div>
                <h3 className="font-syne font-bold text-white">{selected.sender_name}</h3>
                <a href={`mailto:${selected.sender_email}`} className="text-sm" style={{ color: '#c9a96e' }}>
                  {selected.sender_email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#6b7280' }}>{formatDate(selected.created_at)}</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white transition-colors ml-2">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#e5e7eb' }}>
                {selected.message}
              </p>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4" style={{ borderTop: '1px solid #2a2a35' }}>
              <a
                href={`mailto:${selected.sender_email}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#c9a96e', color: '#000' }}
              >
                Reply via Email
              </a>
              <button
                onClick={() => { handleDelete(selected.id); setSelected(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                style={{ background: '#2a2a35', color: '#f87171' }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

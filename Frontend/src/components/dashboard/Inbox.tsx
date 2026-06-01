import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2, CheckCheck, Inbox as InboxIcon } from 'lucide-react';
import api from '../../lib/axios';

interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

const Inbox: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = () => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = (id: number) => {
    api.patch(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      })
      .catch(() => {});
  };

  const handleMarkAllRead = () => {
    api.patch('/notifications/read-all')
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      })
      .catch(() => {});
  };

  const handleDelete = (id: number) => {
    api.delete(`/notifications/${id}`)
      .then(() => setNotifications(prev => prev.filter(n => n.id !== id)))
      .catch(() => {});
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Boîte de réception</h1>
          <p className="text-text-soft mt-1">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'text-text-soft hover:text-text-dark'}`}>
                {f === 'all' ? 'Tous' : 'Non lus'}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl font-medium transition-colors">
              <CheckCheck className="w-4 h-4" />
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <InboxIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Aucune notification</h3>
          <p className="text-text-soft">Vous n'avez pas encore de notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${n.is_read ? 'border-gray-100' : 'border-primary/20 bg-primary/[0.02]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-primary/10'}`}>
                    <Bell className={`w-4 h-4 ${n.is_read ? 'text-gray-400' : 'text-primary'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`font-semibold text-sm ${n.is_read ? 'text-text-dark' : 'text-text-dark'}`}>{n.title}</h3>
                      {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-text-soft">{n.message}</p>
                    <p className="text-xs text-text-soft mt-1">
                      {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Marquer lu">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;

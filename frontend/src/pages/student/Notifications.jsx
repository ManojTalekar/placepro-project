import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to update.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification.');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'drive':
        return { icon: 'bi-briefcase-fill', color: 'var(--primary-light)' };
      case 'application':
        return { icon: 'bi-file-earmark-check-fill', color: 'var(--secondary)' };
      case 'interview':
        return { icon: 'bi-calendar-event-fill', color: 'var(--accent)' };
      case 'success':
        return { icon: 'bi-check-circle-fill', color: 'var(--accent-green)' };
      default:
        return { icon: 'bi-bell-fill', color: 'var(--text-secondary)' };
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">Real-time alerts regarding drives, shortlists, tests, and interview schedules</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-pp btn-pp-outline">
              <i className="bi bi-check2-all me-1"></i> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pp-tabs mb-4">
        <button className={`pp-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Notifications ({notifications.length})
        </button>
        <button className={`pp-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          Unread ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <div className="loading-spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
          <h5 className="mt-3" style={{ fontWeight: 600 }}>No Notifications</h5>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {filter === 'unread' ? 'You have read all your notifications!' : 'You have no notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(n => {
            const { icon, color } = getIcon(n.notification_type);
            return (
              <div
                key={n.id}
                className="pp-card d-flex align-items-start justify-content-between gap-3"
                style={{
                  background: n.is_read ? 'var(--bg-card)' : 'rgba(99,102,241,0.06)',
                  borderColor: n.is_read ? 'var(--border-light)' : 'rgba(99,102,241,0.3)',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      color: color,
                      flexShrink: 0
                    }}
                  >
                    <i className={`bi ${icon}`}></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="badge-pp badge-pp-primary" style={{ fontSize: '0.65rem' }}>
                          New
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <i className="bi bi-clock me-1"></i>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="btn-pp"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'transparent', color: 'var(--primary-light)' }}
                      title="Mark as Read"
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="btn-pp"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'transparent', color: 'var(--accent-red)' }}
                    title="Delete Notification"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

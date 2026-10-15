import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const navItems = [
  { to: '/student/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { to: '/student/drives', icon: 'bi-briefcase', label: 'Placement Drives' },
  { to: '/student/applications', icon: 'bi-file-earmark-check', label: 'My Applications' },
  { to: '/student/resume-analyzer', icon: 'bi-robot', label: 'Resume Analyzer' },
  { to: '/student/skill-gap', icon: 'bi-bar-chart-steps', label: 'Skill Gap Analysis' },
  { to: '/student/tests', icon: 'bi-journal-check', label: 'Mock Tests' },
  { to: '/student/interview-prep', icon: 'bi-person-workspace', label: 'Interview Prep' },
  { to: '/student/profile', icon: 'bi-person-circle', label: 'My Profile' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?limit=1');
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎯</div>
          <div>
            <div className="sidebar-logo-text">PlacePro</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cloud Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Account</div>
          <NavLink to="/student/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-bell"></i>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="badge-pp badge-pp-danger ms-auto" style={{ padding: '2px 7px', fontSize: '0.65rem' }}>{unreadCount}</span>
            )}
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'none', width: '100%', color: 'var(--accent-red)' }}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </nav>

        {/* User info at bottom */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Student</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <button className="d-md-none btn-pp btn-pp-outline me-3" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '0.4rem 0.7rem' }}>
            <i className="bi bi-list"></i>
          </button>
          <div className="ms-auto d-flex align-items-center gap-3">
            <NavLink to="/student/notifications" style={{ color: 'var(--text-secondary)', position: 'relative' }}>
              <i className="bi bi-bell" style={{ fontSize: '1.1rem' }}></i>
              {unreadCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, background: 'var(--accent-red)', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </NavLink>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

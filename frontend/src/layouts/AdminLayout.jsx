import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { to: '/admin/students', icon: 'bi-people', label: 'Students' },
  { to: '/admin/companies', icon: 'bi-building', label: 'Companies' },
  { to: '/admin/drives', icon: 'bi-briefcase', label: 'Placement Drives' },
  { to: '/admin/questions', icon: 'bi-question-circle', label: 'Question Bank' },
  { to: '/admin/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚙️</div>
          <div>
            <div className="sidebar-logo-text">PlacePro</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Admin Panel</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Account</div>
          <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-link" style={{ border: 'none', background: 'none', width: '100%', color: 'var(--accent-red)' }}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>Administrator</div>
          </div>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-shield-check me-2" style={{ color: 'var(--accent)' }}></i>
            Admin Control Panel
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  );
}

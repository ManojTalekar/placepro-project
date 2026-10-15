import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const statusColor = {
  applied: 'info', shortlisted: 'warning', selected: 'success',
  rejected: 'danger', on_hold: 'gray', offer_accepted: 'success', offer_declined: 'danger'
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard').then(res => { setData(res.data.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}><div className="loading-spinner"></div></div>;

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Total Applications', value: stats.totalApps || 0, icon: 'bi-file-earmark-text', type: 'primary' },
    { label: 'Shortlisted', value: stats.shortlisted || 0, icon: 'bi-star', type: 'warning' },
    { label: 'Selected', value: stats.selected || 0, icon: 'bi-trophy', type: 'success' },
    { label: 'Tests Taken', value: stats.testCount || 0, icon: 'bi-journal-check', type: 'secondary' },
    { label: 'Avg Test Score', value: `${stats.avgScore || 0}%`, icon: 'bi-bar-chart', type: 'purple' },
    { label: 'Open Drives', value: stats.openDrives || 0, icon: 'bi-briefcase', type: 'danger' },
  ];

  const profile = data?.profile || {};
  const profileCompletion = [
    { label: 'CGPA', done: !!profile.cgpa },
    { label: 'Skills', done: true },
    { label: 'Department', done: !!profile.department },
    { label: 'College', done: !!profile.college },
    { label: 'LinkedIn', done: !!profile.linkedin_url },
  ];
  const completionPct = Math.round((profileCompletion.filter(p => p.done).length / profileCompletion.length) * 100);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">👋 Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's your placement preparation overview</p>
        </div>
        <Link to="/student/drives" className="btn-pp btn-pp-primary">
          <i className="bi bi-briefcase me-1"></i> Browse Drives
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {statCards.map((s, i) => (
          <div className="col-6 col-md-4 col-xl-2" key={i}>
            <div className="stat-card h-100">
              <div className={`stat-icon ${s.type}`}><i className={`bi ${s.icon}`}></i></div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Profile Completion */}
        <div className="col-lg-4">
          <div className="pp-card h-100">
            <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Profile Completion</h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="url(#grad)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 34 * completionPct / 100} ${2 * Math.PI * 34}`}
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>{completionPct}%</div>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{completionPct < 60 ? 'Incomplete' : completionPct < 90 ? 'Almost Done' : 'Complete!'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profile strength</div>
              </div>
            </div>
            {profileCompletion.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < profileCompletion.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.label}</span>
                {p.done ? <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent-green)', fontSize: '0.875rem' }}></i>
                  : <i className="bi bi-x-circle" style={{ color: 'var(--accent-red)', fontSize: '0.875rem' }}></i>}
              </div>
            ))}
            <Link to="/student/profile" className="btn-pp btn-pp-outline w-100 mt-3" style={{ justifyContent: 'center' }}>
              Complete Profile →
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="col-lg-8">
          <div className="pp-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontWeight: 700, margin: 0 }}>Recent Applications</h6>
              <Link to="/student/applications" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>View all →</Link>
            </div>
            {data?.recentApplications?.length > 0 ? (
              <div className="table-responsive">
                <table className="pp-table">
                  <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Applied</th></tr></thead>
                  <tbody>
                    {data.recentApplications.map((app, i) => (
                      <tr key={i}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="company-logo" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{app.company_name?.[0]}</div>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{app.company_name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.drive_title}</td>
                        <td><span className={`badge-pp badge-pp-${statusColor[app.status] || 'gray'}`}>{app.status}</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <i className="bi bi-briefcase" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', opacity: 0.5 }}></i>
                <p style={{ margin: 0 }}>No applications yet.</p>
                <Link to="/student/drives" className="btn-pp btn-pp-primary mt-3">Browse Drives</Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="col-12">
          <div className="pp-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontWeight: 700, margin: 0 }}>Upcoming Placement Drives</h6>
              <Link to="/student/drives" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>View all →</Link>
            </div>
            {data?.upcomingDrives?.length > 0 ? (
              <div className="row g-3">
                {data.upcomingDrives.map((d, i) => (
                  <div className="col-md-6 col-lg-4" key={i}>
                    <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', transition: 'var(--transition)' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="company-logo" style={{ width: 36, height: 36 }}>{d.company_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{d.company_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.location}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{d.title}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                          <i className="bi bi-clock me-1"></i>
                          Deadline: {new Date(d.application_deadline).toLocaleDateString()}
                        </span>
                        <Link to="/student/drives" className="btn-pp btn-pp-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Apply</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No upcoming drives available right now.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <div className="pp-card">
            <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h6>
            <div className="row g-3">
              {[
                { to: '/student/resume-analyzer', icon: '🤖', label: 'Analyze Resume', desc: 'Check your match score', color: '#6366f1' },
                { to: '/student/tests', icon: '📝', label: 'Take a Mock Test', desc: 'Practice aptitude & technical', color: '#0ea5e9' },
                { to: '/student/interview-prep', icon: '💼', label: 'Interview Prep', desc: 'Practice common questions', color: '#10b981' },
                { to: '/student/skill-gap', icon: '📊', label: 'Skill Gap Analysis', desc: 'See what skills to learn', color: '#f59e0b' },
              ].map((a, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <Link to={a.to} style={{ textDecoration: 'none' }}>
                    <div style={{ background: `${a.color}10`, border: `1px solid ${a.color}30`, borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center', transition: 'var(--transition)', cursor: 'pointer' }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${a.color}20`; }}
                      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{a.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{a.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.desc}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

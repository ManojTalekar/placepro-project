import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drives?limit=50');
      setDrives(res.data.drives || []);
    } catch (err) {
      toast.error('Failed to load drives.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 350 }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const openDrives = drives.filter(d => d.status === 'open').length;

  const statCards = [
    { label: 'Published Drives', value: drives.length, icon: 'bi-briefcase', type: 'primary' },
    { label: 'Active Openings', value: openDrives, icon: 'bi-check-circle', type: 'success' },
    { label: 'Drive Status', value: 'Live', icon: 'bi-broadcast', type: 'secondary' },
    { label: 'Company Portal', value: 'Verified', icon: 'bi-shield-check', type: 'purple' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">🏢 Recruiter Talent Portal</h1>
          <p className="page-subtitle">Welcome, {user?.name}. Manage your campus postings, review applications, and schedule candidate interviews.</p>
        </div>
        <Link to="/recruiter/drives" className="btn-pp btn-pp-primary">
          <i className="bi bi-plus-lg me-1"></i> Post New Job Opening
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {statCards.map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
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

      {/* Drives & Candidates Review Feed */}
      <div className="pp-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 style={{ fontWeight: 700, margin: 0 }}>Active Campus Drives & Candidate Pools</h6>
          <Link to="/recruiter/drives" className="btn-pp btn-pp-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Manage All Postings
          </Link>
        </div>

        {drives.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <i className="bi bi-briefcase" style={{ fontSize: '3rem' }}></i>
            <h6 className="mt-2">No jobs posted yet.</h6>
            <p style={{ fontSize: '0.85rem' }}>Click &quot;Post New Job Opening&quot; to begin your campus placement campaign.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {drives.map(d => (
              <div
                key={d.id}
                className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 style={{ fontWeight: 700, margin: 0 }}>{d.title}</h6>
                    <span className={`badge-pp badge-pp-${d.status === 'open' ? 'success' : 'warning'}`}>
                      {d.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {d.company_name} • {d.location || 'Multiple Locations'} • ₹{d.salary_min} - ₹{d.salary_max} LPA
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Deadline: {d.application_deadline ? new Date(d.application_deadline).toLocaleDateString() : 'N/A'} • Openings: {d.openings}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Link
                    to={`/recruiter/drives/${d.id}/applications`}
                    className="btn-pp btn-pp-primary"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    <i className="bi bi-people me-1"></i> Review Applications
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

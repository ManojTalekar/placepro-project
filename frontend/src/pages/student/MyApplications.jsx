import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusColor = {
  applied: 'info', shortlisted: 'warning', selected: 'success',
  rejected: 'danger', on_hold: 'gray', offer_accepted: 'success', offer_declined: 'danger'
};

const formatSalary = (min, max) => {
  const pMin = parseFloat(min) || 0;
  const pMax = parseFloat(max) || 0;
  if (pMin <= 0 && pMax <= 0) return 'Not disclosed';

  const formatNum = (val) => {
    if (!val || val <= 0) return '0';
    if (val >= 100000) {
      const lpa = val / 100000;
      return lpa % 1 === 0 ? lpa.toFixed(0) : lpa.toFixed(1);
    }
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
  };

  if (pMin > 0 && pMax > 0) {
    return `₹${formatNum(pMin)} - ₹${formatNum(pMax)} LPA`;
  }
  if (pMin > 0) return `From ₹${formatNum(pMin)} LPA`;
  return `Up to ₹${formatNum(pMax)} LPA`;
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    api.get('/drives/my-applications')
      .then(res => { setApps(res.data.applications); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleRespondOffer = async (appId, action) => {
    try {
      const res = await api.put(`/drives/applications/${appId}/respond`, { action });
      toast.success(res.data.message);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update offer status.');
    }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const counts = { all: apps.length, applied: 0, shortlisted: 0, selected: 0, rejected: 0 };
  apps.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track your placement drive applications and their current status</p>
      </div>

      {/* Status Summary */}
      <div className="row g-3 mb-4">
        {[
          { key: 'all', label: 'Total', color: 'primary' },
          { key: 'applied', label: 'Applied', color: 'info' },
          { key: 'shortlisted', label: 'Shortlisted', color: 'warning' },
          { key: 'selected', label: 'Selected', color: 'success' },
          { key: 'rejected', label: 'Rejected', color: 'danger' },
        ].map(s => (
          <div className="col" key={s.key}>
            <div className={`stat-card ${filter === s.key ? 'border-primary' : ''}`} style={{ cursor: 'pointer', borderColor: filter === s.key ? 'var(--primary)' : '' }}
              onClick={() => setFilter(s.key)}>
              <div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{counts[s.key]}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="loading-spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>No applications found.</p>
        </div>
      ) : (
        <div className="pp-card">
          <div className="table-responsive">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Company & Role</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Interview Details</th>
                  <th>Applied On</th>
                  <th>Offer Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={i}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="company-logo" style={{ width: 36, height: 36, fontSize: '0.875rem', flexShrink: 0 }}>{app.company_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{app.company_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.drive_title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-pp badge-pp-purple" style={{ textTransform: 'capitalize' }}>{app.job_type?.replace('_', ' ')}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.location || '-'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                      {formatSalary(app.salary_min, app.salary_max)}
                    </td>
                    <td><span className={`badge-pp badge-pp-${statusColor[app.status] || 'gray'}`} style={{ textTransform: 'capitalize' }}>{app.status?.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {app.interview_date ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{new Date(app.interview_date).toLocaleDateString()} {new Date(app.interview_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{app.interview_mode}</div>
                          {app.interview_link && (
                            <a
                              href={app.interview_link.startsWith('http') ? app.interview_link : `https://${app.interview_link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-pp btn-pp-primary mt-1"
                              style={{ padding: '2px 8px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <i className="bi bi-camera-video me-1"></i> Join Interview
                            </a>
                          )}
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>
                      {app.status === 'selected' ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn-pp btn-pp-primary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleRespondOffer(app.id, 'accept')}
                          >
                            🎉 Accept
                          </button>
                          <button
                            className="btn-pp btn-pp-outline"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                            onClick={() => handleRespondOffer(app.id, 'decline')}
                          >
                            Decline
                          </button>
                        </div>
                      ) : app.status === 'offer_accepted' ? (
                        <span className="badge-pp badge-pp-success" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-check2-circle me-1"></i> Accepted
                        </span>
                      ) : app.status === 'offer_declined' ? (
                        <span className="badge-pp badge-pp-danger" style={{ fontSize: '0.75rem' }}>
                          Declined
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Under Evaluation</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

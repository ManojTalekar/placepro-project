import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  open: 'success', upcoming: 'warning', closed: 'danger', cancelled: 'gray'
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
    if (val >= 1000 && val < 100000) {
      return (val / 100000).toFixed(2);
    }
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
  };

  if (pMin > 0 && pMax > 0) {
    return `₹${formatNum(pMin)} - ₹${formatNum(pMax)} LPA`;
  }
  if (pMin > 0) return `From ₹${formatNum(pMin)} LPA`;
  return `Up to ₹${formatNum(pMax)} LPA`;
};

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [eligMap, setEligMap] = useState({});
  const [applyingId, setApplyingId] = useState(null);

  // Modals
  const [detailsModal, setDetailsModal] = useState(null);
  const [eligModal, setEligModal] = useState({ open: false, drive: null, data: null, loading: false });

  useEffect(() => {
    fetchDrives();
  }, [statusFilter]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/drives?status=${statusFilter}`);
      setDrives(res.data.drives || []);
    } catch (err) {
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (drive) => {
    setEligModal({ open: true, drive, data: null, loading: true });
    try {
      const res = await api.get(`/drives/${drive.id}/check-eligibility`);
      const eligibility = res.data.eligibility;
      setEligMap(prev => ({ ...prev, [drive.id]: eligibility }));
      setEligModal({ open: true, drive, data: eligibility, loading: false });
    } catch (err) {
      toast.error('Failed to verify eligibility.');
      setEligModal({ open: false, drive: null, data: null, loading: false });
    }
  };

  const applyToDrive = async (drive) => {
    const driveId = drive.id;
    setApplyingId(driveId);
    try {
      await api.post(`/drives/${driveId}/apply`, {});
      toast.success('🎉 Application submitted successfully!');
      setEligMap(prev => ({
        ...prev,
        [driveId]: { ...(prev[driveId] || {}), alreadyApplied: true, isEligible: true }
      }));
      if (detailsModal?.id === driveId) {
        setDetailsModal(null);
      }
      fetchDrives();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        toast.error(`Eligibility criteria not met: ${errors.join(' • ')}`, { duration: 6000 });
        checkEligibility(drive);
      } else {
        toast.error(err.response?.data?.message || 'Application failed.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = drives.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">💼 Campus Placement Drives</h1>
          <p className="page-subtitle">Browse verified hiring opportunities, evaluate eligibility, and track your applications</p>
        </div>
        <Link to="/student/applications" className="btn-pp btn-pp-outline">
          <i className="bi bi-file-earmark-check me-1"></i> My Applications
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="pp-card mb-4" style={{ padding: '1rem 1.5rem' }}>
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'var(--bg-dark)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                className="form-control-pp"
                placeholder="Search by company, role, or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end">
            <div className="pp-tabs">
              {['open', 'upcoming', 'closed'].map(s => (
                <button
                  key={s}
                  className={`pp-tab ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {s === 'open' && '🟢 '}
                  {s === 'upcoming' && '🟡 '}
                  {s === 'closed' && '🔴 '}
                  {s} Drives
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="loading-spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}></i>
          <h5 style={{ color: 'var(--text-secondary)' }}>No placement drives found</h5>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try switching filters between Open and Upcoming drives.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((drive) => {
            const isApplied = eligMap[drive.id]?.alreadyApplied;
            return (
              <div className="col-md-6 col-xl-4" key={drive.id}>
                <div className="pp-card h-100 d-flex flex-column justify-content-between" style={{ position: 'relative' }}>
                  <div>
                    {/* Top Company Row */}
                    <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            color: 'var(--primary-light)',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}
                        >
                          {drive.logo_url ? (
                            <img src={drive.logo_url} alt={drive.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            drive.company_name?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{drive.company_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drive.industry || 'Technology'}</div>
                        </div>
                      </div>
                      <span className={`badge-pp badge-pp-${statusColors[drive.status] || 'primary'}`}>
                        {drive.status}
                      </span>
                    </div>

                    {/* Job Role Title */}
                    <h5 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      {drive.title}
                    </h5>

                    {/* Meta: Location & Formatted Salary */}
                    <div className="d-flex flex-wrap gap-2 mb-2" style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <i className="bi bi-geo-alt me-1" style={{ color: 'var(--accent)' }}></i>
                        {drive.location || 'Multiple Locations'}
                      </span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                        <i className="bi bi-cash-stack me-1"></i>
                        {formatSalary(drive.salary_min, drive.salary_max)}
                      </span>
                    </div>

                    {/* Job Description Preview */}
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      marginBottom: '0.75rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {drive.job_description || 'Click "View Full Details" to read the complete job description, responsibilities, and criteria.'}
                    </p>

                    {/* Eligibility Criteria Summary Tags */}
                    <div className="d-flex flex-wrap gap-1 mb-3" style={{ fontSize: '0.72rem' }}>
                      <span className="badge-pp badge-pp-secondary" style={{ padding: '2px 8px' }}>
                        Min CGPA: {drive.min_cgpa ? parseFloat(drive.min_cgpa).toFixed(1) : 'None'}
                      </span>
                      <span className="badge-pp badge-pp-purple" style={{ padding: '2px 8px' }}>
                        Backlogs ≤ {drive.max_backlogs ?? 0}
                      </span>
                      {(drive.graduation_year_from || drive.graduation_year_to) && (
                        <span className="badge-pp badge-pp-warning" style={{ padding: '2px 8px' }}>
                          Batch: {drive.graduation_year_from || 'Any'} - {drive.graduation_year_to || 'Any'}
                        </span>
                      )}
                      {drive.required_departments && (
                        <span className="badge-pp badge-pp-outline" style={{ padding: '2px 8px' }}>
                          {drive.required_departments}
                        </span>
                      )}
                    </div>

                    {/* Required Skills */}
                    {drive.required_skills && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {drive.required_skills.split(',').slice(0, 3).map((s, i) => (
                          <span key={i} className="badge-pp badge-pp-primary" style={{ fontSize: '0.7rem' }}>
                            {s.trim()}
                          </span>
                        ))}
                        {drive.required_skills.split(',').length > 3 && (
                          <span className="badge-pp badge-pp-outline" style={{ fontSize: '0.7rem' }}>
                            +{drive.required_skills.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Openings & Deadline */}
                    <div className="d-flex justify-content-between align-items-center mb-3 pt-2" style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>
                        <i className="bi bi-people me-1"></i> Openings: <strong style={{ color: 'var(--text-primary)' }}>{drive.openings || 1}</strong>
                      </span>
                      <span>
                        <i className="bi bi-calendar me-1"></i> Deadline: <strong style={{ color: 'var(--text-primary)' }}>{drive.application_deadline ? new Date(drive.application_deadline).toLocaleDateString() : 'Rolling'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-column gap-2 mt-auto">
                    <button
                      onClick={() => setDetailsModal(drive)}
                      className="btn-pp btn-pp-outline w-100"
                      style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.45rem' }}
                    >
                      <i className="bi bi-info-circle me-1"></i> View Full Details & Job Description
                    </button>

                    <div className="d-flex gap-2">
                      <button
                        onClick={() => checkEligibility(drive)}
                        className="btn-pp btn-pp-outline flex-fill"
                        style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.45rem' }}
                      >
                        <i className="bi bi-check2-circle me-1"></i> Check Eligibility
                      </button>

                      {drive.status === 'open' && (
                        <button
                          onClick={() => applyToDrive(drive)}
                          className="btn-pp btn-pp-primary flex-fill"
                          style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.45rem' }}
                          disabled={applyingId === drive.id || isApplied}
                        >
                          {applyingId === drive.id ? (
                            <span className="loading-spinner" style={{ width: 14, height: 14 }}></span>
                          ) : isApplied ? (
                            '✓ Applied'
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: FULL JOB DESCRIPTION & DRIVE DETAILS */}
      {detailsModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 700, margin: '5vh auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    color: 'var(--primary-light)'
                  }}
                >
                  {detailsModal.company_name?.[0]}
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, margin: 0 }}>{detailsModal.title}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {detailsModal.company_name} • {detailsModal.location || 'Multiple Locations'}
                  </div>
                </div>
              </div>
              <button
                className="btn-pp"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                onClick={() => setDetailsModal(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="row g-2 mb-4 p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div className="col-6 col-md-3">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Salary Package</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                  {formatSalary(detailsModal.salary_min, detailsModal.salary_max)}
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Type</div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{detailsModal.job_type?.replace('_', ' ') || 'Full Time'}</div>
              </div>
              <div className="col-6 col-md-3">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Openings</div>
                <div style={{ fontWeight: 700 }}>{detailsModal.openings || 1} Positions</div>
              </div>
              <div className="col-6 col-md-3">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadline</div>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {detailsModal.application_deadline ? new Date(detailsModal.application_deadline).toLocaleDateString() : 'Rolling'}
                </div>
              </div>
            </div>

            {/* Required Skills */}
            {detailsModal.required_skills && (
              <div className="mb-4">
                <h6 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Required Skills</h6>
                <div className="d-flex flex-wrap gap-2">
                  {detailsModal.required_skills.split(',').map((s, idx) => (
                    <span key={idx} className="badge-pp badge-pp-primary" style={{ fontSize: '0.8rem' }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Configured Eligibility Rules */}
            <div className="mb-4">
              <h6 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Configured Eligibility Criteria</h6>
              <div className="row g-2" style={{ fontSize: '0.85rem' }}>
                <div className="col-md-6 p-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Minimum CGPA:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsModal.min_cgpa || 'None required'}</strong>
                </div>
                <div className="col-md-6 p-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Maximum Backlogs:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsModal.max_backlogs ?? 'Any'}</strong>
                </div>
                <div className="col-md-6 p-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Required Degree:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsModal.required_degree || 'Open to all degrees'}</strong>
                </div>
                <div className="col-md-6 p-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Eligible Departments:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsModal.required_departments || 'Open to all departments'}</strong>
                </div>
                <div className="col-12 p-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Graduation Batch:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {detailsModal.graduation_year_from || 'Any'} - {detailsModal.graduation_year_to || 'Any'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Detailed Job Description */}
            <div className="mb-4">
              <h6 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Job Description & Responsibilities</h6>
              <div
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line'
                }}
              >
                {detailsModal.job_description || 'No detailed description provided by the recruiter.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="d-flex justify-content-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className="btn-pp btn-pp-outline"
                onClick={() => setDetailsModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-pp btn-pp-outline"
                onClick={() => {
                  const d = detailsModal;
                  setDetailsModal(null);
                  checkEligibility(d);
                }}
              >
                <i className="bi bi-check2-circle me-1"></i> Verify My Eligibility
              </button>
              {detailsModal.status === 'open' && (
                <button
                  type="button"
                  className="btn-pp btn-pp-primary"
                  onClick={() => applyToDrive(detailsModal)}
                  disabled={applyingId === detailsModal.id || eligMap[detailsModal.id]?.alreadyApplied}
                >
                  {eligMap[detailsModal.id]?.alreadyApplied ? '✓ Already Applied' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE ELIGIBILITY BREAKDOWN */}
      {eligModal.open && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 600, margin: '8vh auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontWeight: 700, margin: 0 }}>
                Eligibility Analysis: {eligModal.drive?.title}
              </h5>
              <button
                className="btn-pp"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                onClick={() => setEligModal({ open: false, drive: null, data: null, loading: false })}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {eligModal.loading ? (
              <div className="text-center py-5">
                <div className="loading-spinner mb-2"></div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evaluating candidate profile against recruiter rules...</div>
              </div>
            ) : eligModal.data ? (
              <div>
                {/* Result Banner */}
                <div
                  className="p-3 mb-4 text-center"
                  style={{
                    background: eligModal.data.isEligible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${eligModal.data.isEligible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                    {eligModal.data.isEligible ? '✅' : '❌'}
                  </div>
                  <h6 style={{ fontWeight: 700, margin: 0, color: eligModal.data.isEligible ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {eligModal.data.isEligible
                      ? 'Congratulations! You meet all configured eligibility criteria.'
                      : 'You currently do not meet all requirements for this placement drive.'}
                  </h6>
                  {eligModal.data.alreadyApplied && (
                    <span className="badge-pp badge-pp-primary mt-2">You Have Already Applied</span>
                  )}
                </div>

                {/* Criteria Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Rule Criterion</th>
                        <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Required</th>
                        <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Your Profile</th>
                        <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligModal.data.criteria?.map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ fontWeight: 600 }}>{c.criterion}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{String(c.required)}</td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{String(c.actual)}</td>
                          <td style={{ textAlign: 'center' }}>
                            {c.passed ? (
                              <span className="badge-pp badge-pp-success" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-check-lg me-1"></i> Pass
                              </span>
                            ) : (
                              <span className="badge-pp badge-pp-danger" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-x-lg me-1"></i> Not Met
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Guidance if not eligible */}
                {!eligModal.data.isEligible && (
                  <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <i className="bi bi-lightbulb me-1" style={{ color: 'var(--accent)' }}></i>
                    If your academic scores or graduation year have changed, update them in{' '}
                    <Link to="/student/profile" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                      My Profile
                    </Link>{' '}
                    before re-checking.
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn-pp btn-pp-outline"
                    onClick={() => setEligModal({ open: false, drive: null, data: null, loading: false })}
                  >
                    Close
                  </button>
                  {eligModal.data.isEligible && !eligModal.data.alreadyApplied && eligModal.drive?.status === 'open' && (
                    <button
                      type="button"
                      className="btn-pp btn-pp-primary"
                      onClick={() => {
                        const dId = eligModal.drive.id;
                        setEligModal({ open: false, drive: null, data: null, loading: false });
                        applyToDrive(dId);
                      }}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

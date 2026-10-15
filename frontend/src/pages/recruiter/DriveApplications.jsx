import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function DriveApplications() {
  const { user } = useAuth();
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal for status / interview scheduling
  const [activeModal, setActiveModal] = useState({
    open: false,
    app: null,
    status: '',
    recruiter_notes: '',
    interview_date: '',
    interview_mode: 'online',
    interview_link: ''
  });

  useEffect(() => {
    fetchDriveAndApplications();
  }, [id]);

  const fetchDriveAndApplications = async () => {
    setLoading(true);
    try {
      const [driveRes, appRes] = await Promise.all([
        api.get(`/drives/${id}`),
        api.get(`/drives/${id}/applications`)
      ]);
      setDrive(driveRes.data.drive);
      setApplications(appRes.data.applications || []);
    } catch (err) {
      toast.error('Failed to load drive applications.');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (app, defaultStatus) => {
    setActiveModal({
      open: true,
      app,
      status: defaultStatus || app.status,
      recruiter_notes: app.recruiter_notes || '',
      interview_date: app.interview_date ? app.interview_date.slice(0, 16) : '',
      interview_mode: app.interview_mode || 'online',
      interview_link: app.interview_link || ''
    });
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!activeModal.app) return;

    try {
      await api.put(`/drives/applications/${activeModal.app.id}/status`, {
        status: activeModal.status,
        recruiter_notes: activeModal.recruiter_notes,
        interview_date: activeModal.interview_date || null,
        interview_mode: activeModal.interview_mode,
        interview_link: activeModal.interview_link || null
      });
      toast.success(`Application updated to: ${activeModal.status}`);
      setActiveModal({ open: false, app: null, status: '', recruiter_notes: '', interview_date: '', interview_mode: 'online', interview_link: '' });
      fetchDriveAndApplications();
    } catch (err) {
      toast.error('Failed to update application status.');
    }
  };

  const filtered = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to={user?.role === 'admin' ? '/admin/drives' : '/recruiter/drives'} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <i className="bi bi-arrow-left me-1"></i> Back to Drives
            </Link>
          </div>
          <h1 className="page-title">{drive?.title || 'Drive Applications'}</h1>
          <p className="page-subtitle">
            {drive?.company_name} • Total Candidates Applied: <strong style={{ color: 'var(--text-primary)' }}>{applications.length}</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pp-tabs mb-4">
        <button className={`pp-tab ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
          All Applicants ({applications.length})
        </button>
        <button className={`pp-tab ${statusFilter === 'applied' ? 'active' : ''}`} onClick={() => setStatusFilter('applied')}>
          Under Review ({applications.filter(a => a.status === 'applied').length})
        </button>
        <button className={`pp-tab ${statusFilter === 'shortlisted' ? 'active' : ''}`} onClick={() => setStatusFilter('shortlisted')}>
          Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})
        </button>
        <button className={`pp-tab ${statusFilter === 'selected' ? 'active' : ''}`} onClick={() => setStatusFilter('selected')}>
          Selected / Offers ({applications.filter(a => a.status === 'selected').length})
        </button>
        <button className={`pp-tab ${statusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setStatusFilter('rejected')}>
          Rejected ({applications.filter(a => a.status === 'rejected').length})
        </button>
      </div>

      {/* Applications Table */}
      <div className="pp-card">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
            <div className="loading-spinner"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
            <h6 className="mt-3">No applications in this category.</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Candidate</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>College & Dept</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>CGPA</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Backlogs</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {app.student_email} • {app.phone || 'No phone'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{app.department || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.college || 'N/A'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: (app.cgpa >= 7.5) ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                        {app.cgpa ?? 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pp badge-pp-${app.backlogs > 0 ? 'danger' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                        {app.backlogs ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pp badge-pp-${
                        app.status === 'selected' ? 'success' :
                        app.status === 'shortlisted' ? 'warning' :
                        app.status === 'rejected' ? 'danger' : 'primary'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {app.status}
                      </span>
                      {app.interview_date && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 2 }}>
                          <i className="bi bi-calendar-check me-1"></i>
                          {new Date(app.interview_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="d-flex justify-content-end gap-2">
                        {app.status !== 'shortlisted' && app.status !== 'selected' && (
                          <button
                            onClick={() => openActionModal(app, 'shortlisted')}
                            className="btn-pp btn-pp-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent)' }}
                            title="Shortlist Candidate"
                          >
                            <i className="bi bi-star"></i> Shortlist
                          </button>
                        )}
                        <button
                          onClick={() => openActionModal(app, app.status)}
                          className="btn-pp btn-pp-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-gear me-1"></i> Update / Interview
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Update Status & Schedule Interview */}
      {activeModal.open && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 550, margin: '6vh auto' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>
              Candidate Evaluation: {activeModal.app?.student_name}
            </h5>
            <form onSubmit={handleSaveStatus} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label-pp">Application Status</label>
                <select
                  className="form-select-pp"
                  value={activeModal.status}
                  onChange={e => setActiveModal({ ...activeModal, status: e.target.value })}
                >
                  <option value="applied">Applied (Under Review)</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected (Offer Rolled Out)</option>
                  <option value="rejected">Rejected</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="form-label-pp">Recruiter Evaluation Notes</label>
                <textarea
                  rows="2"
                  className="form-control-pp"
                  placeholder="Feedback on candidate profile, strengths, coding score..."
                  value={activeModal.recruiter_notes}
                  onChange={e => setActiveModal({ ...activeModal, recruiter_notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                  📅 Schedule Interview (Optional)
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label-pp">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control-pp"
                      value={activeModal.interview_date}
                      onChange={e => setActiveModal({ ...activeModal, interview_date: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-pp">Interview Mode</label>
                    <select
                      className="form-select-pp"
                      value={activeModal.interview_mode}
                      onChange={e => setActiveModal({ ...activeModal, interview_mode: e.target.value })}
                    >
                      <option value="online">Online Video Call</option>
                      <option value="in_person">In-Person Campus Interview</option>
                      <option value="telephonic">Telephonic</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="form-label-pp">Interview Meeting Link / Venue</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="https://meet.google.com/... or Campus Room #302"
                    value={activeModal.interview_link}
                    onChange={e => setActiveModal({ ...activeModal, interview_link: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn-pp btn-pp-outline"
                  onClick={() => setActiveModal({ open: false, app: null, status: '', recruiter_notes: '', interview_date: '', interview_mode: 'online', interview_link: '' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pp btn-pp-primary">
                  Save & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({
    company_id: '',
    title: '',
    job_description: '',
    job_type: 'full_time',
    location: '',
    salary_min: '',
    salary_max: '',
    required_skills: '',
    min_cgpa: '',
    max_backlogs: '0',
    required_degree: '',
    required_departments: '',
    graduation_year_from: '2023',
    graduation_year_to: '2028',
    application_deadline: '',
    drive_date: '',
    openings: '1',
    status: 'open'
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, [statusFilter]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      let url = '/drives?limit=50';
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setDrives(res.data.drives || []);
    } catch (err) {
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data.companies || []);
    } catch {}
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!form.company_id || !form.title) {
      toast.error('Company and Job Title are required.');
      return;
    }
    try {
      await api.post('/drives', form);
      toast.success('Placement Drive published and broadcast to students!');
      setCreateModal(false);
      setForm({
        company_id: '',
        title: '',
        job_description: '',
        job_type: 'full_time',
        location: '',
        salary_min: '',
        salary_max: '',
        required_skills: '',
        min_cgpa: '',
        max_backlogs: '0',
        required_degree: '',
        required_departments: '',
        graduation_year_from: '2023',
        graduation_year_to: '2028',
        application_deadline: '',
        drive_date: '',
        openings: '1',
        status: 'open'
      });
      fetchDrives();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create drive.');
    }
  };

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      await api.put(`/drives/${driveId}`, { status: newStatus });
      toast.success(`Drive status changed to ${newStatus}`);
      fetchDrives();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status.');
    }
  };

  const filtered = drives.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">🚀 Placement Drives Management</h1>
          <p className="page-subtitle">Configure company recruitment drives, automated eligibility criteria, and deadlines</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-pp btn-pp-primary">
          <i className="bi bi-plus-lg me-1"></i> Post Placement Drive
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="pp-card mb-4" style={{ padding: '1rem 1.5rem' }}>
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'var(--bg-dark)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control-pp"
                placeholder="Search drives by job role, company, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select-pp" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Drive Statuses</option>
              <option value="open">Open (Accepting Applications)</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
          <div className="loading-spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
          <h6 className="mt-3">No placement drives found</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click &quot;Post Placement Drive&quot; to publish a campus drive.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(d => (
            <div key={d.id} className="pp-card">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
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
                    {d.logo_url ? (
                      <img src={d.logo_url} alt={d.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      d.company_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <h5 style={{ fontWeight: 700, margin: 0 }}>{d.title}</h5>
                      <span className={`badge-pp badge-pp-${
                        d.status === 'open' ? 'success' : d.status === 'upcoming' ? 'warning' : 'danger'
                      }`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {d.status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {d.company_name} • {d.location || 'Multiple Locations'} • <span style={{ color: 'var(--accent-green)' }}>₹{d.salary_min} - ₹{d.salary_max} LPA</span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher & Applicant Action */}
                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select-pp"
                    style={{ width: 'auto', minWidth: 130, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}
                    value={d.status}
                    onChange={e => handleStatusChange(d.id, e.target.value)}
                  >
                    <option value="open">🟢 Open</option>
                    <option value="upcoming">🟡 Upcoming</option>
                    <option value="closed">🔴 Closed</option>
                  </select>
                  <Link
                    to={`/admin/drives/${d.id}/applications`}
                    className="btn-pp btn-pp-outline"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <i className="bi bi-people me-1"></i> View Candidates
                  </Link>
                </div>
              </div>

              {/* Eligibility & Criteria Pills */}
              <div className="d-flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
                <span className="badge-pp badge-pp-primary">
                  <i className="bi bi-mortarboard me-1"></i> Min CGPA: {d.min_cgpa || 'None'}
                </span>
                <span className="badge-pp badge-pp-secondary">
                  <i className="bi bi-clock-history me-1"></i> Max Backlogs: {d.max_backlogs ?? 'Any'}
                </span>
                <span className="badge-pp badge-pp-warning">
                  <i className="bi bi-calendar-check me-1"></i> Deadline: {d.application_deadline ? new Date(d.application_deadline).toLocaleDateString() : 'Open'}
                </span>
                <span className="badge-pp badge-pp-purple">
                  <i className="bi bi-person-check me-1"></i> Openings: {d.openings || 1}
                </span>
                {(d.graduation_year_from || d.graduation_year_to) && (
                  <span className="badge-pp badge-pp-primary">
                    <i className="bi bi-mortarboard-fill me-1"></i> Batches: {d.graduation_year_from || 'Any'} - {d.graduation_year_to || 'Any'}
                  </span>
                )}
                {d.required_skills && (
                  <span className="badge-pp badge-pp-outline">
                    <i className="bi bi-code me-1"></i> Skills: {d.required_skills}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Post New Placement Drive */}
      {createModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 700, margin: '5vh auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Post New Placement Drive</h5>
            <form onSubmit={handleCreateDrive} className="row g-3">
              <div className="col-md-6">
                <label className="form-label-pp">Partner Company *</label>
                <select
                  className="form-select-pp"
                  value={form.company_id}
                  onChange={e => setForm({ ...form, company_id: e.target.value })}
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Job Role Title *</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. Associate Software Engineer"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Job Type</label>
                <select
                  className="form-select-pp"
                  value={form.job_type}
                  onChange={e => setForm({ ...form, job_type: e.target.value })}
                >
                  <option value="full_time">Full Time</option>
                  <option value="internship">Internship</option>
                  <option value="internship_to_fulltime">Internship + PPO</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Drive Status *</label>
                <select
                  className="form-select-pp"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="open">🟢 Open (Active Applications)</option>
                  <option value="upcoming">🟡 Upcoming</option>
                  <option value="closed">🔴 Closed</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Location</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. Bangalore / Hybrid"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Openings</label>
                <input
                  type="number"
                  className="form-control-pp"
                  value={form.openings}
                  onChange={e => setForm({ ...form, openings: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Salary Min (LPA / INR)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control-pp"
                  placeholder="e.g. 6.5"
                  value={form.salary_min}
                  onChange={e => setForm({ ...form, salary_min: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Salary Max (LPA / INR)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control-pp"
                  placeholder="e.g. 12.0"
                  value={form.salary_max}
                  onChange={e => setForm({ ...form, salary_max: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label-pp">Required Skills (Comma-separated for AI Matching)</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. Java, Spring Boot, MySQL, REST API, Git, Docker"
                  value={form.required_skills}
                  onChange={e => setForm({ ...form, required_skills: e.target.value })}
                />
              </div>

              <div className="col-12">
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
                  ⚙️ Configurable Eligibility Rules
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Min CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control-pp"
                  placeholder="e.g. 7.0"
                  value={form.min_cgpa}
                  onChange={e => setForm({ ...form, min_cgpa: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Max Backlogs</label>
                <input
                  type="number"
                  className="form-control-pp"
                  value={form.max_backlogs}
                  onChange={e => setForm({ ...form, max_backlogs: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Eligible Depts</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="CSE, IT, MCA"
                  value={form.required_departments}
                  onChange={e => setForm({ ...form, required_departments: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Required Degree</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="B.Tech, MCA"
                  value={form.required_degree}
                  onChange={e => setForm({ ...form, required_degree: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Batch / Grad Year From</label>
                <input
                  type="number"
                  className="form-control-pp"
                  placeholder="e.g. 2023"
                  value={form.graduation_year_from}
                  onChange={e => setForm({ ...form, graduation_year_from: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label-pp">Batch / Grad Year To</label>
                <input
                  type="number"
                  className="form-control-pp"
                  placeholder="e.g. 2028"
                  value={form.graduation_year_to}
                  onChange={e => setForm({ ...form, graduation_year_to: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Application Deadline</label>
                <input
                  type="date"
                  className="form-control-pp"
                  value={form.application_deadline}
                  onChange={e => setForm({ ...form, application_deadline: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Drive Assessment Date</label>
                <input
                  type="date"
                  className="form-control-pp"
                  value={form.drive_date}
                  onChange={e => setForm({ ...form, drive_date: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label-pp">Job Description & Responsibilities</label>
                <textarea
                  rows="4"
                  className="form-control-pp"
                  placeholder="Provide comprehensive job description, day-to-day responsibilities, and selection procedure..."
                  value={form.job_description}
                  onChange={e => setForm({ ...form, job_description: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn-pp btn-pp-outline" onClick={() => setCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-pp btn-pp-primary">
                  Publish Placement Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

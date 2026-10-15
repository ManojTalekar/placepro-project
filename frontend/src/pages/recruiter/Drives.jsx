import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RecruiterDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
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
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drives?limit=50');
      setDrives(res.data.drives || []);
    } catch (err) {
      toast.error('Failed to load job postings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data.companies || []);
      if (res.data.companies?.length > 0) {
        setForm(prev => ({ ...prev, company_id: res.data.companies[0].id }));
      }
    } catch {}
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!form.company_id || !form.title) {
      toast.error('Company and Title are required.');
      return;
    }
    try {
      await api.post('/drives', form);
      toast.success('Job posting created successfully!');
      setModalOpen(false);
      setForm({
        company_id: companies?.[0]?.id || '',
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
      toast.error(err.response?.data?.message || 'Failed to create posting.');
    }
  };

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      await api.put(`/drives/${driveId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchDrives();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status.');
    }
  };

  const filtered = drives.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">💼 My Job Postings & Drives</h1>
          <p className="page-subtitle">Publish job vacancies, configure criteria, and manage recruitment lifecycles</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-pp btn-pp-primary">
          <i className="bi bi-plus-lg me-1"></i> Post New Job
        </button>
      </div>

      {/* Search Bar */}
      <div className="pp-card mb-4" style={{ padding: '1rem 1.5rem' }}>
        <div className="input-group" style={{ maxWidth: 450 }}>
          <span className="input-group-text" style={{ background: 'var(--bg-dark)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control-pp"
            placeholder="Search your posted drives..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List of Postings */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
          <div className="loading-spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
          <h6 className="mt-3">No job postings found.</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Click &quot;Post New Job&quot; to publish your opening.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(d => (
            <div key={d.id} className="pp-card">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <h5 style={{ fontWeight: 700, margin: 0 }}>{d.title}</h5>
                    <span className={`badge-pp badge-pp-${d.status === 'open' ? 'success' : 'warning'}`}>
                      {d.status}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {d.company_name} • {d.location || 'Multiple Locations'} • <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>₹{d.salary_min} - ₹{d.salary_max} LPA</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Deadline: {d.application_deadline ? new Date(d.application_deadline).toLocaleDateString() : 'N/A'} • Openings: {d.openings}
                  </div>
                </div>

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
                    to={`/recruiter/drives/${d.id}/applications`}
                    className="btn-pp btn-pp-primary"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    <i className="bi bi-people me-1"></i> Review Applicants
                  </Link>
                </div>
              </div>

              {/* Requirements summary */}
              <div className="d-flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
                <span className="badge-pp badge-pp-primary">Min CGPA: {d.min_cgpa || 'None'}</span>
                <span className="badge-pp badge-pp-secondary">Max Backlogs: {d.max_backlogs ?? 'Any'}</span>
                {d.required_skills && (
                  <span className="badge-pp badge-pp-outline">Skills: {d.required_skills}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Post New Job */}
      {modalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 700, margin: '5vh auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Create Campus Job Posting</h5>
            <form onSubmit={handleCreateDrive} className="row g-3">
              <div className="col-md-6">
                <label className="form-label-pp">Company *</label>
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
                <label className="form-label-pp">Job Title *</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. Cloud Engineer / Full Stack Developer"
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
                  placeholder="e.g. Bangalore, Remote"
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
                <label className="form-label-pp">Salary Min (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control-pp"
                  placeholder="e.g. 8.0"
                  value={form.salary_min}
                  onChange={e => setForm({ ...form, salary_min: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Salary Max (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control-pp"
                  placeholder="e.g. 15.0"
                  value={form.salary_max}
                  onChange={e => setForm({ ...form, salary_max: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label-pp">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. React, Node.js, AWS, MySQL, Docker"
                  value={form.required_skills}
                  onChange={e => setForm({ ...form, required_skills: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label-pp">Min CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control-pp"
                  placeholder="e.g. 7.5"
                  value={form.min_cgpa}
                  onChange={e => setForm({ ...form, min_cgpa: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label-pp">Max Backlogs</label>
                <input
                  type="number"
                  className="form-control-pp"
                  value={form.max_backlogs}
                  onChange={e => setForm({ ...form, max_backlogs: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label-pp">Application Deadline</label>
                <input
                  type="date"
                  className="form-control-pp"
                  value={form.application_deadline}
                  onChange={e => setForm({ ...form, application_deadline: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Eligible Batch From</label>
                <input
                  type="number"
                  className="form-control-pp"
                  placeholder="e.g. 2023"
                  value={form.graduation_year_from}
                  onChange={e => setForm({ ...form, graduation_year_from: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-pp">Eligible Batch To</label>
                <input
                  type="number"
                  className="form-control-pp"
                  placeholder="e.g. 2028"
                  value={form.graduation_year_to}
                  onChange={e => setForm({ ...form, graduation_year_to: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label-pp">Job Description</label>
                <textarea
                  rows="3"
                  className="form-control-pp"
                  placeholder="Detailed job description, candidate requirements, and recruitment rounds..."
                  value={form.job_description}
                  onChange={e => setForm({ ...form, job_description: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn-pp btn-pp-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-pp btn-pp-primary">
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, student: null, newStatus: '' });

  useEffect(() => {
    fetchStudents();
  }, [deptFilter, statusFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `/admin/students?limit=100`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (deptFilter) url += `&department=${encodeURIComponent(deptFilter)}`;
      if (statusFilter) url += `&placement_status=${encodeURIComponent(statusFilter)}`;

      const res = await api.get(url);
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleUpdateStatus = async () => {
    if (!statusModal.student || !statusModal.newStatus) return;
    try {
      await api.put(`/admin/students/${statusModal.student.id}/placement-status`, {
        placement_status: statusModal.newStatus
      });
      toast.success('Placement status updated!');
      setStatusModal({ open: false, student: null, newStatus: '' });
      fetchStudents();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">🎓 Student Placement Directory</h1>
          <p className="page-subtitle">Track, filter, and manage student eligibility, records, and placement outcomes</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="pp-card mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'var(--bg-dark)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control-pp"
                placeholder="Search by name, email, roll no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select className="form-select-pp" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="MCA">Master of Computer Applications</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          <div className="col-md-3">
            <select className="form-select-pp" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Placement Statuses</option>
              <option value="placed">Placed</option>
              <option value="not_placed">Not Placed</option>
              <option value="opted_out">Opted Out</option>
            </select>
          </div>

          <div className="col-md-2">
            <button type="submit" className="btn-pp btn-pp-primary w-100">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Students Table */}
      <div className="pp-card">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
            <div className="loading-spinner"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <i className="bi bi-people" style={{ fontSize: '2.5rem' }}></i>
            <h6 className="mt-2">No students match your query.</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Roll No</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>CGPA</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Backlogs</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{s.roll_number || 'N/A'}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td>{s.department || 'Not configured'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: (s.cgpa >= 8.0) ? 'var(--accent-green)' : (s.cgpa >= 6.5) ? 'var(--text-primary)' : 'var(--accent-red)' }}>
                        {s.cgpa ?? 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pp badge-pp-${s.backlogs > 0 ? 'danger' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                        {s.backlogs ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pp badge-pp-${s.placement_status === 'placed' ? 'success' : s.placement_status === 'opted_out' ? 'gray' : 'warning'}`}>
                        {s.placement_status === 'placed' ? 'Placed' : s.placement_status === 'opted_out' ? 'Opted Out' : 'Seeking Placement'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="btn-pp btn-pp-outline"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="View Profile Details"
                        >
                          <i className="bi bi-eye"></i> Details
                        </button>
                        <button
                          onClick={() => setStatusModal({ open: true, student: s, newStatus: s.placement_status || 'not_placed' })}
                          className="btn-pp btn-pp-primary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Update Status"
                        >
                          <i className="bi bi-pencil-square"></i> Status
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

      {/* MODAL: Update Placement Status */}
      {statusModal.open && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 450, margin: '10vh auto' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Update Placement Status</h5>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Change recruitment outcome for <strong style={{ color: 'var(--text-primary)' }}>{statusModal.student?.name}</strong>:
            </p>
            <div className="mb-3">
              <label className="form-label-pp">Status</label>
              <select
                className="form-select-pp"
                value={statusModal.newStatus}
                onChange={e => setStatusModal({ ...statusModal, newStatus: e.target.value })}
              >
                <option value="not_placed">Seeking Placement (Not Placed)</option>
                <option value="placed">Placed (Offer Confirmed)</option>
                <option value="opted_out">Opted Out (Higher Studies / Off-Campus)</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn-pp btn-pp-outline"
                onClick={() => setStatusModal({ open: false, student: null, newStatus: '' })}
              >
                Cancel
              </button>
              <button type="button" className="btn-pp btn-pp-primary" onClick={handleUpdateStatus}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Student Profile Details */}
      {selectedStudent && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 650, margin: '6vh auto', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontWeight: 700, margin: 0 }}>Student Dossier: {selectedStudent.name}</h5>
              <button
                className="btn-pp"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                onClick={() => setSelectedStudent(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="row g-3" style={{ fontSize: '0.875rem' }}>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-muted)' }}>Roll Number:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.roll_number || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.email}</div>
              </div>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.phone || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-muted)' }}>College:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.college || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.department || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-muted)' }}>Degree & Grad Year:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.degree || 'N/A'} ({selectedStudent.graduation_year || 'N/A'})</div>
              </div>
              <div className="col-md-4">
                <span style={{ color: 'var(--text-muted)' }}>CGPA:</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{selectedStudent.cgpa ?? 'N/A'}</div>
              </div>
              <div className="col-md-4">
                <span style={{ color: 'var(--text-muted)' }}>Active Backlogs:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.backlogs ?? 0}</div>
              </div>
              <div className="col-md-4">
                <span style={{ color: 'var(--text-muted)' }}>10th / 12th %:</span>
                <div style={{ fontWeight: 600 }}>{selectedStudent.tenth_percentage || 'N/A'}% / {selectedStudent.twelfth_percentage || 'N/A'}%</div>
              </div>
              <div className="col-12">
                <span style={{ color: 'var(--text-muted)' }}>Links:</span>
                <div className="d-flex gap-3 mt-1">
                  {selectedStudent.linkedin_url && (
                    <a href={selectedStudent.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)' }}>
                      <i className="bi bi-linkedin me-1"></i> LinkedIn
                    </a>
                  )}
                  {selectedStudent.github_url && (
                    <a href={selectedStudent.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>
                      <i className="bi bi-github me-1"></i> GitHub
                    </a>
                  )}
                  {selectedStudent.portfolio_url && (
                    <a href={selectedStudent.portfolio_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                      <i className="bi bi-globe me-1"></i> Portfolio
                    </a>
                  )}
                </div>
              </div>
              {selectedStudent.bio && (
                <div className="col-12 mt-2">
                  <span style={{ color: 'var(--text-muted)' }}>Bio:</span>
                  <p style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 8, marginTop: 4 }}>
                    {selectedStudent.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button className="btn-pp btn-pp-outline" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

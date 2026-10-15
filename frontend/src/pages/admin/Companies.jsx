import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyModal, setCompanyModal] = useState({ open: false, isEdit: false, data: {} });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data.companies || []);
    } catch (err) {
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCompanyModal({
      open: true,
      isEdit: false,
      data: { name: '', industry: '', website: '', logo_url: '', description: '', headquarters: '', company_size: '1000+' }
    });
  };

  const openEditModal = (comp) => {
    setCompanyModal({
      open: true,
      isEdit: true,
      data: { ...comp }
    });
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    const { id, ...payload } = companyModal.data;
    if (!payload.name) return toast.error('Company name is required.');

    try {
      if (companyModal.isEdit) {
        await api.put(`/admin/companies/${id}`, payload);
        toast.success('Company updated successfully!');
      } else {
        await api.post('/admin/companies', payload);
        toast.success('Company added successfully!');
      }
      setCompanyModal({ open: false, isEdit: false, data: {} });
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    }
  };

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">🏢 Recruiting Partner Companies</h1>
          <p className="page-subtitle">Manage campus hiring partners, corporate relationships, and recruiter accounts</p>
        </div>
        <button onClick={openAddModal} className="btn-pp btn-pp-primary">
          <i className="bi bi-plus-lg me-1"></i> Add Partner Company
        </button>
      </div>

      {/* Search */}
      <div className="pp-card mb-4" style={{ padding: '1rem 1.5rem' }}>
        <div className="input-group" style={{ maxWidth: 400 }}>
          <span className="input-group-text" style={{ background: 'var(--bg-dark)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control-pp"
            placeholder="Search companies by name or industry..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
          <div className="loading-spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-building" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
          <h6 className="mt-3">No companies found</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Get started by adding your first hiring partner company.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map(comp => (
            <div className="col-md-6 col-xl-4" key={comp.id}>
              <div className="pp-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
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
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          color: 'var(--primary-light)',
                          overflow: 'hidden'
                        }}
                      >
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          comp.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{comp.name}</div>
                        <span className="badge-pp badge-pp-primary" style={{ fontSize: '0.7rem' }}>
                          {comp.industry || 'Tech'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openEditModal(comp)}
                      className="btn-pp btn-pp-outline"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Edit Company"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>

                  {comp.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {comp.description}
                    </p>
                  )}

                  <div className="d-flex flex-column gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {comp.headquarters && (
                      <div>
                        <i className="bi bi-geo-alt me-2" style={{ color: 'var(--accent)' }}></i>
                        {comp.headquarters}
                      </div>
                    )}
                    {comp.company_size && (
                      <div>
                        <i className="bi bi-people me-2" style={{ color: 'var(--secondary)' }}></i>
                        {comp.company_size} Employees
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                  {comp.website ? (
                    <a href={comp.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                      <i className="bi bi-globe me-1"></i> Visit Website
                    </a>
                  ) : (
                    <span></span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Partner #{comp.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Add / Edit Company */}
      {companyModal.open && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 550, margin: '8vh auto' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>
              {companyModal.isEdit ? 'Edit Company Information' : 'Register New Partner Company'}
            </h5>
            <form onSubmit={handleSaveCompany} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label-pp">Company Name *</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. Google, Microsoft, Infosys"
                  value={companyModal.data.name || ''}
                  onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, name: e.target.value } })}
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label-pp">Industry Sector</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="e.g. Software, Fintech, Edtech"
                    value={companyModal.data.industry || ''}
                    onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, industry: e.target.value } })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-pp">Company Size</label>
                  <select
                    className="form-select-pp"
                    value={companyModal.data.company_size || '500-1000'}
                    onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, company_size: e.target.value } })}
                  >
                    <option value="1-50">1-50 (Startup)</option>
                    <option value="50-200">50-200 (Mid-size)</option>
                    <option value="200-1000">200-1000 (Growth)</option>
                    <option value="1000+">1000+ (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label-pp">Official Website</label>
                  <input
                    type="url"
                    className="form-control-pp"
                    placeholder="https://..."
                    value={companyModal.data.website || ''}
                    onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, website: e.target.value } })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-pp">Headquarters Location</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="e.g. Bangalore, Hyderabad, Remote"
                    value={companyModal.data.headquarters || ''}
                    onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, headquarters: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label-pp">Logo Image URL</label>
                <input
                  type="url"
                  className="form-control-pp"
                  placeholder="https://example.com/logo.png"
                  value={companyModal.data.logo_url || ''}
                  onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, logo_url: e.target.value } })}
                />
              </div>

              <div>
                <label className="form-label-pp">About Company</label>
                <textarea
                  rows="3"
                  className="form-control-pp"
                  placeholder="Brief description of the company culture, tech stack, and offerings..."
                  value={companyModal.data.description || ''}
                  onChange={e => setCompanyModal({ ...companyModal, data: { ...companyModal.data, description: e.target.value } })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn-pp btn-pp-outline"
                  onClick={() => setCompanyModal({ open: false, isEdit: false, data: {} })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pp btn-pp-primary">
                  {companyModal.isEdit ? 'Save Changes' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

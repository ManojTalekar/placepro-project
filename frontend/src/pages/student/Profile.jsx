import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('academic');

  // New item inputs
  const [newSkill, setNewSkill] = useState({ skill_name: '', skill_type: 'technical', proficiency: 'intermediate' });
  const [newProject, setNewProject] = useState({ title: '', description: '', tech_stack: '', project_url: '', github_url: '' });
  const [newCert, setNewCert] = useState({ title: '', issuer: '', issue_date: '', credential_url: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      setProfile(res.data.profile || {});
    } catch (err) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/student/profile', profile);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skill_name.trim()) return toast.error('Skill name is required.');
    try {
      await api.post('/student/skills', newSkill);
      toast.success('Skill added!');
      setNewSkill({ skill_name: '', skill_type: 'technical', proficiency: 'intermediate' });
      fetchProfile();
    } catch (err) {
      toast.error('Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await api.delete(`/student/skills/${id}`);
      toast.success('Skill removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to delete skill.');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return toast.error('Project title is required.');
    try {
      await api.post('/student/projects', newProject);
      toast.success('Project added!');
      setNewProject({ title: '', description: '', tech_stack: '', project_url: '', github_url: '' });
      fetchProfile();
    } catch (err) {
      toast.error('Failed to add project.');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/student/projects/${id}`);
      toast.success('Project removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to delete project.');
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newCert.title.trim()) return toast.error('Certification title is required.');
    try {
      await api.post('/student/certifications', newCert);
      toast.success('Certification added!');
      setNewCert({ title: '', issuer: '', issue_date: '', credential_url: '' });
      fetchProfile();
    } catch (err) {
      toast.error('Failed to add certification.');
    }
  };

  const handleDeleteCert = async (id) => {
    try {
      await api.delete(`/student/certifications/${id}`);
      toast.success('Certification removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to delete certification.');
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return toast.error('Please select a PDF file.');
    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      setUploadingResume(true);
      await api.post('/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resume uploaded successfully!');
      setResumeFile(null);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      await api.delete(`/student/resume/${id}`);
      toast.success('Resume deleted.');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to delete resume.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 350 }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your personal, academic, skill, and resume information for recruiters</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge-pp badge-pp-${profile.placement_status === 'placed' ? 'success' : 'warning'}`}>
            <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
            {profile.placement_status === 'placed' ? 'Placed' : 'Not Placed'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="pp-tabs mb-4">
        <button className={`pp-tab ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}>
          <i className="bi bi-mortarboard me-1"></i> Academic & Personal
        </button>
        <button className={`pp-tab ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
          <i className="bi bi-tools me-1"></i> Skills ({profile.skills?.length || 0})
        </button>
        <button className={`pp-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          <i className="bi bi-code-slash me-1"></i> Projects ({profile.projects?.length || 0})
        </button>
        <button className={`pp-tab ${activeTab === 'certs' ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>
          <i className="bi bi-patch-check me-1"></i> Certifications ({profile.certifications?.length || 0})
        </button>
        <button className={`pp-tab ${activeTab === 'resumes' ? 'active' : ''}`} onClick={() => setActiveTab('resumes')}>
          <i className="bi bi-file-earmark-pdf me-1"></i> Resumes ({profile.resumes?.length || 0})
        </button>
      </div>

      {/* TAB 1: ACADEMIC & PERSONAL */}
      {activeTab === 'academic' && (
        <form onSubmit={handleUpdateProfile} className="pp-card">
          <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Personal & Academic Details</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label-pp">Full Name</label>
              <input
                type="text"
                className="form-control-pp"
                value={profile.name || ''}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label-pp">Email (Read Only)</label>
              <input type="email" className="form-control-pp" value={profile.email || ''} disabled />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Roll Number</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="e.g. 21MCA045"
                value={profile.roll_number || ''}
                onChange={e => setProfile({ ...profile, roll_number: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">Phone Number</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="+91 9876543210"
                value={profile.phone || ''}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">Gender</label>
              <select
                className="form-select-pp"
                value={profile.gender || 'Male'}
                onChange={e => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label-pp">College / Institute</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="e.g. National Institute of Technology"
                value={profile.college || ''}
                onChange={e => setProfile({ ...profile, college: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label-pp">Department</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="e.g. Computer Science and Engineering"
                value={profile.department || ''}
                onChange={e => setProfile({ ...profile, department: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Degree</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="e.g. B.Tech / MCA / M.Tech"
                value={profile.degree || ''}
                onChange={e => setProfile({ ...profile, degree: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">Graduation Year</label>
              <input
                type="number"
                className="form-control-pp"
                placeholder="e.g. 2025"
                value={profile.graduation_year || ''}
                onChange={e => setProfile({ ...profile, graduation_year: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">CGPA (Out of 10.0)</label>
              <input
                type="number"
                step="0.01"
                className="form-control-pp"
                placeholder="e.g. 8.45"
                value={profile.cgpa || ''}
                onChange={e => setProfile({ ...profile, cgpa: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Active Backlogs</label>
              <input
                type="number"
                className="form-control-pp"
                placeholder="0"
                value={profile.backlogs ?? 0}
                onChange={e => setProfile({ ...profile, backlogs: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">10th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-control-pp"
                placeholder="e.g. 88.5"
                value={profile.tenth_percentage || ''}
                onChange={e => setProfile({ ...profile, tenth_percentage: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">12th / Diploma (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-control-pp"
                placeholder="e.g. 85.0"
                value={profile.twelfth_percentage || ''}
                onChange={e => setProfile({ ...profile, twelfth_percentage: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">LinkedIn Profile URL</label>
              <input
                type="url"
                className="form-control-pp"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedin_url || ''}
                onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">GitHub Profile URL</label>
              <input
                type="url"
                className="form-control-pp"
                placeholder="https://github.com/username"
                value={profile.github_url || ''}
                onChange={e => setProfile({ ...profile, github_url: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-pp">Portfolio / Website</label>
              <input
                type="url"
                className="form-control-pp"
                placeholder="https://myportfolio.dev"
                value={profile.portfolio_url || ''}
                onChange={e => setProfile({ ...profile, portfolio_url: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label-pp">Professional Bio</label>
              <textarea
                rows="3"
                className="form-control-pp"
                placeholder="Brief summary of your career objectives, technical focus, and aspirations..."
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" disabled={saving} className="btn-pp btn-pp-primary">
              {saving ? <span className="loading-spinner me-2" style={{ width: 16, height: 16 }}></span> : <i className="bi bi-check-lg me-1"></i>}
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === 'skills' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Add New Skill</h6>
              <form onSubmit={handleAddSkill} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label-pp">Skill Name</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="e.g. React, Python, Docker"
                    value={newSkill.skill_name}
                    onChange={e => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Category</label>
                  <select
                    className="form-select-pp"
                    value={newSkill.skill_type}
                    onChange={e => setNewSkill({ ...newSkill, skill_type: e.target.value })}
                  >
                    <option value="technical">Technical</option>
                    <option value="tool">Tool / DevOps</option>
                    <option value="soft">Soft Skill</option>
                    <option value="language">Language</option>
                  </select>
                </div>
                <div>
                  <label className="form-label-pp">Proficiency</label>
                  <select
                    className="form-select-pp"
                    value={newSkill.proficiency}
                    onChange={e => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <button type="submit" className="btn-pp btn-pp-primary mt-2">
                  <i className="bi bi-plus-lg me-1"></i> Add Skill
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Current Skills ({profile.skills?.length || 0})</h6>
              {!profile.skills?.length ? (
                <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  <i className="bi bi-tools d-block mb-2" style={{ fontSize: '2rem' }}></i>
                  No skills listed yet. Add your technical and soft skills to improve matching!
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <div
                      key={s.id}
                      className="d-flex align-items-center gap-2 px-3 py-2"
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.skill_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {s.skill_type} • <span style={{ color: 'var(--primary-light)' }}>{s.proficiency}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(s.id)}
                        className="btn-pp"
                        style={{ padding: '2px 6px', background: 'transparent', color: 'var(--accent-red)', border: 'none' }}
                        title="Delete skill"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Add Project</h6>
              <form onSubmit={handleAddProject} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label-pp">Project Title</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="e.g. Cloud E-Commerce Platform"
                    value={newProject.title}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="React, Node.js, AWS, MySQL"
                    value={newProject.tech_stack}
                    onChange={e => setNewProject({ ...newProject, tech_stack: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="form-control-pp"
                    placeholder="https://github.com/..."
                    value={newProject.github_url}
                    onChange={e => setNewProject({ ...newProject, github_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Live Demo URL (optional)</label>
                  <input
                    type="url"
                    className="form-control-pp"
                    placeholder="https://..."
                    value={newProject.project_url}
                    onChange={e => setNewProject({ ...newProject, project_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Description</label>
                  <textarea
                    rows="3"
                    className="form-control-pp"
                    placeholder="Explain what the project does and your contribution..."
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn-pp btn-pp-primary mt-2">
                  <i className="bi bi-plus-lg me-1"></i> Add Project
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Showcased Projects ({profile.projects?.length || 0})</h6>
              {!profile.projects?.length ? (
                <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  <i className="bi bi-code-slash d-block mb-2" style={{ fontSize: '2rem' }}></i>
                  No projects added yet. Showcase your academic or personal builds!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {profile.projects.map(p => (
                    <div
                      key={p.id}
                      className="p-3"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.title}</div>
                          {p.tech_stack && (
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {p.tech_stack.split(',').map((tech, idx) => (
                                <span key={idx} className="badge-pp badge-pp-primary" style={{ fontSize: '0.7rem' }}>
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="btn-pp"
                          style={{ padding: '4px 8px', background: 'transparent', color: 'var(--accent-red)', border: 'none' }}
                          title="Delete project"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      {p.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{p.description}</p>}
                      <div className="d-flex gap-3 mt-2" style={{ fontSize: '0.8rem' }}>
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)' }}>
                            <i className="bi bi-github me-1"></i> Code Repository
                          </a>
                        )}
                        {p.project_url && (
                          <a href={p.project_url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>
                            <i className="bi bi-box-arrow-up-right me-1"></i> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATIONS */}
      {activeTab === 'certs' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Add Certification</h6>
              <form onSubmit={handleAddCert} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label-pp">Certificate Title</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="e.g. AWS Certified Solutions Architect"
                    value={newCert.title}
                    onChange={e => setNewCert({ ...newCert, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Issuing Organization</label>
                  <input
                    type="text"
                    className="form-control-pp"
                    placeholder="e.g. Amazon Web Services, Coursera"
                    value={newCert.issuer}
                    onChange={e => setNewCert({ ...newCert, issuer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Issue Date</label>
                  <input
                    type="date"
                    className="form-control-pp"
                    value={newCert.issue_date}
                    onChange={e => setNewCert({ ...newCert, issue_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-pp">Credential URL</label>
                  <input
                    type="url"
                    className="form-control-pp"
                    placeholder="https://..."
                    value={newCert.credential_url}
                    onChange={e => setNewCert({ ...newCert, credential_url: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-pp btn-pp-primary mt-2">
                  <i className="bi bi-plus-lg me-1"></i> Add Certification
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>My Certifications ({profile.certifications?.length || 0})</h6>
              {!profile.certifications?.length ? (
                <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  <i className="bi bi-patch-check d-block mb-2" style={{ fontSize: '2rem' }}></i>
                  No certifications listed yet.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {profile.certifications.map(c => (
                    <div
                      key={c.id}
                      className="d-flex justify-content-between align-items-center p-3"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {c.issuer} {c.issue_date && `• ${new Date(c.issue_date).toLocaleDateString()}`}
                        </div>
                        {c.credential_url && (
                          <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            <i className="bi bi-box-arrow-up-right me-1"></i> View Credential
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCert(c.id)}
                        className="btn-pp"
                        style={{ padding: '4px 8px', background: 'transparent', color: 'var(--accent-red)', border: 'none' }}
                        title="Delete certification"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RESUMES */}
      {activeTab === 'resumes' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Upload Resume (PDF)</h6>
              <form onSubmit={handleUploadResume} className="d-flex flex-column gap-3">
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    background: 'rgba(99,102,241,0.03)',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('resume-file-input').click()}
                >
                  <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2.5rem', color: 'var(--primary-light)' }}></i>
                  <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>
                    {resumeFile ? resumeFile.name : 'Click to select PDF resume'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Max 10MB PDF format. Primary resume will be parsed for AI analytics.
                  </div>
                  <input
                    id="resume-file-input"
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setResumeFile(e.target.files[0])}
                  />
                </div>
                <button type="submit" disabled={uploadingResume || !resumeFile} className="btn-pp btn-pp-primary">
                  {uploadingResume ? <span className="loading-spinner me-2" style={{ width: 16, height: 16 }}></span> : <i className="bi bi-upload me-1"></i>}
                  Upload to Cloud Storage
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Uploaded Resumes ({profile.resumes?.length || 0})</h6>
              {!profile.resumes?.length ? (
                <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  <i className="bi bi-file-earmark-pdf d-block mb-2" style={{ fontSize: '2rem' }}></i>
                  No resumes uploaded yet. Upload your PDF resume to unlock AI matching.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {profile.resumes.map(r => (
                    <div
                      key={r.id}
                      className="d-flex justify-content-between align-items-center p-3"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: '1.75rem', color: 'var(--accent-red)' }}></i>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.file_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Uploaded on {new Date(r.uploaded_at).toLocaleDateString()}
                            {r.is_primary === 1 && (
                              <span className="badge-pp badge-pp-success ms-2" style={{ fontSize: '0.65rem' }}>Primary</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {r.file_url && (
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-pp btn-pp-outline"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i> View
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteResume(r.id)}
                          className="btn-pp"
                          style={{ padding: '4px 8px', background: 'transparent', color: 'var(--accent-red)', border: 'none' }}
                          title="Delete resume"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

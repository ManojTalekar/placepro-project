import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({ drive_id: '', job_title: '', job_description: '', resume_text: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('analyze');

  useEffect(() => {
    api.get('/drives?status=open').then(res => setDrives(res.data.drives)).catch(() => {});
    loadHistory();
  }, []);

  const loadHistory = () => {
    api.get('/resume/history').then(res => setHistory(res.data.history)).catch(() => {});
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!form.drive_id && !form.job_description) {
      toast.error('Please select a drive or provide a job description.');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await api.post('/resume/analyze', form);
      setResult(res.data.analysis);
      loadHistory();
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🤖 AI Resume Analyzer</h1>
        <p className="page-subtitle">Analyze your resume against job requirements and get personalized improvement tips</p>
      </div>

      <div className="pp-tabs mb-4" style={{ width: 'fit-content' }}>
        <button className={`pp-tab ${activeTab === 'analyze' ? 'active' : ''}`} onClick={() => setActiveTab('analyze')}>Analyze Resume</button>
        <button className={`pp-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History ({history.length})</button>
      </div>

      {activeTab === 'analyze' && (
        <div className="row g-4">
          {/* Input Form */}
          <div className="col-lg-5">
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Analysis Parameters</h6>

              <div className="alert alert-info mb-4" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-info-circle me-2"></i>
                This analyzer uses your profile skills and bio. Make sure your profile and skills are up to date.
              </div>

              <form onSubmit={handleAnalyze}>
                <div className="mb-3">
                  <label className="pp-label">Select a Placement Drive (Optional)</label>
                  <select className="pp-select w-100" value={form.drive_id} onChange={e => setForm({ ...form, drive_id: e.target.value, job_description: '', job_title: '' })}>
                    <option value="">-- Select a drive to auto-fill JD --</option>
                    {drives.map(d => (
                      <option key={d.id} value={d.id}>{d.company_name} - {d.title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0.75rem 0', fontSize: '0.875rem' }}>── OR ──</div>

                <div className="mb-3">
                  <label className="pp-label">Job Title</label>
                  <input className="pp-input" placeholder="e.g. Software Engineer" value={form.job_title}
                    onChange={e => setForm({ ...form, job_title: e.target.value, drive_id: '' })} />
                </div>

                <div className="mb-3">
                  <label className="pp-label">Job Description *</label>
                  <textarea className="pp-input" rows={4} placeholder="Paste the job description or role requirements..."
                    value={form.job_description} onChange={e => setForm({ ...form, job_description: e.target.value, drive_id: '' })}
                    style={{ resize: 'vertical' }}></textarea>
                </div>

                <div className="mb-4">
                  <label className="pp-label">Resume Content (Optional)</label>
                  <textarea className="pp-input" rows={4} placeholder="Paste specific resume bullet points or projects (leave empty to use your profile)..."
                    value={form.resume_text} onChange={e => setForm({ ...form, resume_text: e.target.value })}
                    style={{ resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" className="btn-pp btn-pp-primary w-100" style={{ justifyContent: 'center', padding: '0.75rem' }} disabled={analyzing}>
                  {analyzing ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Analyzing...</>
                  ) : (
                    <><i className="bi bi-robot me-2"></i>Analyze My Resume</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="col-lg-7">
            {!result && !analyzing && (
              <div className="pp-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
                <h5 style={{ marginBottom: '0.5rem' }}>Ready to Analyze</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Select a drive or enter a job description and click "Analyze My Resume" to see your match score and recommendations.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="pp-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div className="loading-spinner mx-auto mb-3"></div>
                <p style={{ color: 'var(--text-muted)' }}>Analyzing your profile against job requirements...</p>
              </div>
            )}

            {result && (
              <div className="animate-fade-up">
                {/* Score Card */}
                <div className="pp-card mb-4">
                  <div className="d-flex align-items-center gap-4">
                    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                      <svg viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                        <circle cx="55" cy="55" r="45" fill="none" stroke={getScoreColor(result.matchScore)} strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 45 * result.matchScore / 100} ${2 * Math.PI * 45}`}
                          strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 1s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: getScoreColor(result.matchScore) }}>{result.matchScore}%</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Match Score</span>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{result.jobTitle}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        {result.matchScore >= 75 ? '🎉 Great match! You are well-prepared for this role.' :
                          result.matchScore >= 50 ? '📊 Moderate match. Focus on the missing skills.' :
                            '⚠️ Low match. Significant skill development needed.'}
                      </p>
                      <div className="d-flex gap-2">
                        <span className="badge-pp badge-pp-success">✓ {result.matchingSkills.length} Skills Matched</span>
                        <span className="badge-pp badge-pp-danger">✗ {result.missingSkills.length} Skills Missing</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile completeness */}
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Profile Completeness</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{result.completenessScore}%</span>
                    </div>
                    <div className="pp-progress">
                      <div className="pp-progress-bar" style={{ width: `${result.completenessScore}%`, background: getScoreColor(result.completenessScore) }}></div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="pp-card h-100">
                      <h6 style={{ fontWeight: 700, color: 'var(--accent-green)', marginBottom: '0.75rem' }}>✅ Matching Skills</h6>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {result.matchingSkills.length > 0 ? result.matchingSkills.map((s, i) => (
                          <span key={i} className="skill-tag matched">{s}</span>
                        )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No matching skills found</span>}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="pp-card h-100">
                      <h6 style={{ fontWeight: 700, color: 'var(--accent-red)', marginBottom: '0.75rem' }}>❌ Missing Skills</h6>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                          <span key={i} className="skill-tag missing">{s}</span>
                        )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No missing skills!</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="pp-card">
                  <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>💡 Recommendations</h6>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < result.recommendations.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <i className="bi bi-lightbulb" style={{ color: 'var(--accent)', marginTop: 2 }}></i>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="pp-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Analysis History</h6>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No analysis history yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="pp-table">
                <thead><tr><th>Job Title</th><th>Match Score</th><th>Matching</th><th>Missing</th><th>Date</th></tr></thead>
                <tbody>
                  {history.map((h, i) => {
                    const matching = JSON.parse(h.matching_skills || '[]');
                    const missing = JSON.parse(h.missing_skills || '[]');
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{h.job_title}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="pp-progress" style={{ width: 60 }}>
                              <div className="pp-progress-bar" style={{ width: `${h.match_score}%`, background: getScoreColor(h.match_score) }}></div>
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: getScoreColor(h.match_score) }}>{h.match_score}%</span>
                          </div>
                        </td>
                        <td><span className="badge-pp badge-pp-success">{matching.length} skills</span></td>
                        <td><span className="badge-pp badge-pp-danger">{missing.length} skills</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.analyzed_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

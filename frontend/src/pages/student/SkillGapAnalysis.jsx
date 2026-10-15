import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function SkillGapAnalysis() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/drives?status=open').then(res => setDrives(res.data.drives));
  }, []);

  const analyze = async () => {
    if (!selectedDrive) return;
    setLoading(true);
    try {
      const res = await api.get(`/resume/skill-gap/${selectedDrive}`);
      setResult(res.data.skillGap);
    } catch {}
    setLoading(false);
  };

  const priorityColors = { high: 'danger', medium: 'warning', low: 'info' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📊 Skill Gap Analysis</h1>
        <p className="page-subtitle">Compare your skills with job requirements to identify what to learn next</p>
      </div>

      <div className="pp-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-8">
            <label className="pp-label">Select a Placement Drive to Analyze</label>
            <select className="pp-select w-100" value={selectedDrive} onChange={e => { setSelectedDrive(e.target.value); setResult(null); }}>
              <option value="">-- Choose a placement drive --</option>
              {drives.map(d => <option key={d.id} value={d.id}>{d.company_name} - {d.title}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <button className="btn-pp btn-pp-primary w-100" style={{ justifyContent: 'center', padding: '0.65rem' }}
              onClick={analyze} disabled={!selectedDrive || loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-bar-chart-steps me-2"></i>Analyze Gap</>}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="animate-fade-up">
          {/* Match Score Banner */}
          <div className="pp-card mb-4" style={{ background: result.matchPercentage >= 70 ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)', borderColor: result.matchPercentage >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
                  {result.drive.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                  {result.matchingSkills.length} of {result.requiredSkills.length} required skills matched
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: result.matchPercentage >= 70 ? 'var(--accent-green)' : result.matchPercentage >= 40 ? 'var(--accent)' : 'var(--accent-red)', lineHeight: 1 }}>{result.matchPercentage}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skill Match</div>
              </div>
            </div>
            <div className="pp-progress mt-3">
              <div className="pp-progress-bar" style={{ width: `${result.matchPercentage}%`, background: result.matchPercentage >= 70 ? 'var(--gradient-success)' : result.matchPercentage >= 40 ? 'var(--gradient-warning)' : 'var(--gradient-danger)' }}></div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Matched Skills */}
            <div className="col-md-6">
              <div className="pp-card h-100">
                <h6 style={{ fontWeight: 700, color: 'var(--accent-green)', marginBottom: '1rem' }}>
                  <i className="bi bi-check-circle-fill me-2"></i>Skills You Have ({result.matchingSkills.length})
                </h6>
                {result.matchingSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>None of the required skills found.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {result.matchingSkills.map((s, i) => <span key={i} className="skill-tag matched"><i className="bi bi-check2 me-1"></i>{s}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="col-md-6">
              <div className="pp-card h-100">
                <h6 style={{ fontWeight: 700, color: 'var(--accent-red)', marginBottom: '1rem' }}>
                  <i className="bi bi-x-circle-fill me-2"></i>Skills to Learn ({result.missingSkills.length})
                </h6>
                {result.missingSkills.length === 0 ? (
                  <p style={{ color: 'var(--accent-green)', fontSize: '0.875rem' }}>🎉 You have all required skills!</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {result.missingSkills.map((s, i) => <span key={i} className="skill-tag missing"><i className="bi bi-x me-1"></i>{s}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Priorities */}
          {result.learningPriorities.length > 0 && (
            <div className="pp-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>📚 Learning Priority Roadmap</h6>
              <div className="row g-3">
                {result.learningPriorities.map((item, i) => (
                  <div className="col-md-6" key={i}>
                    <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span className={`badge-pp badge-pp-${priorityColors[item.priority]}`} style={{ flexShrink: 0, marginTop: 2 }}>{item.priority}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.skill}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.suggestion}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="pp-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h5 style={{ color: 'var(--text-secondary)' }}>Select a Drive to Begin</h5>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Choose a placement drive above and click "Analyze Gap" to see which skills you need to develop.</p>
        </div>
      )}
    </div>
  );
}

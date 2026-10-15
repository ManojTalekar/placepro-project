import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const categoryIcons = {
  aptitude: 'bi-calculator', technical: 'bi-cpu', programming: 'bi-code-slash',
  verbal: 'bi-chat-text', interview: 'bi-person-workspace'
};

const difficultyColors = { easy: 'success', medium: 'warning', hard: 'danger', mixed: 'purple' };

export default function MockTests() {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('tests');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/assessment/categories'),
      api.get('/assessment/tests'),
      api.get('/assessment/history')
    ]).then(([cats, tests, hist]) => {
      setCategories(cats.data.categories);
      setTests(tests.data.tests);
      setHistory(hist.data.history);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredTests = selectedCat ? tests.filter(t => t.category_id == selectedCat) : tests;

  const avgScore = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.percentage, 0) / history.length) : 0;
  const bestScore = history.length > 0 ? Math.round(Math.max(...history.map(h => h.percentage))) : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📝 Mock Tests</h1>
        <p className="page-subtitle">Practice aptitude and technical questions to boost your placement readiness</p>
      </div>

      {/* Summary Stats */}
      {history.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Tests Completed', value: history.length, icon: 'bi-check-circle', color: 'success' },
            { label: 'Average Score', value: `${avgScore}%`, icon: 'bi-bar-chart', color: 'primary' },
            { label: 'Best Score', value: `${bestScore}%`, icon: 'bi-trophy', color: 'warning' },
          ].map((s, i) => (
            <div className="col-md-4" key={i}>
              <div className="stat-card">
                <div className={`stat-icon ${s.color}`}><i className={`bi ${s.icon}`}></i></div>
                <div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pp-tabs mb-4" style={{ width: 'fit-content' }}>
        <button className={`pp-tab ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>Available Tests</button>
        <button className={`pp-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>My Results ({history.length})</button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="loading-spinner"></div></div>
      ) : activeTab === 'tests' ? (
        <>
          {/* Category Filter */}
          <div className="d-flex gap-2 flex-wrap mb-4">
            <button className={`pp-tab ${!selectedCat ? 'active' : ''}`} onClick={() => setSelectedCat('')} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-full)' }}>All</button>
            {categories.map(c => (
              <button key={c.id} className={`pp-tab ${selectedCat == c.id ? 'active' : ''}`}
                onClick={() => setSelectedCat(selectedCat == c.id ? '' : c.id)}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-full)' }}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {filteredTests.length === 0 ? (
            <div className="pp-card text-center py-5">
              <i className="bi bi-journal-x" style={{ fontSize: '3rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
              <p style={{ color: 'var(--text-muted)' }}>No tests available in this category.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredTests.map(test => {
                const attempted = history.find(h => h.test_id === test.id);
                return (
                  <div className="col-md-6 col-lg-4" key={test.id}>
                    <div className="pp-card h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                          <i className={`bi ${categoryIcons[test.category_type] || 'bi-journal-check'}`}></i>
                        </div>
                        <span className={`badge-pp badge-pp-${difficultyColors[test.difficulty]}`}>{test.difficulty}</span>
                      </div>
                      <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{test.title}</h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{test.description}</p>

                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <i className="bi bi-question-circle me-1"></i>{test.total_questions} Questions
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <i className="bi bi-clock me-1"></i>{test.duration_minutes} mins
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <i className="bi bi-check2-all me-1"></i>Pass: {test.passing_score}%
                        </span>
                      </div>

                      {attempted && (
                        <div style={{ background: `rgba(${attempted.percentage >= test.passing_score ? '16,185,129' : '239,68,68'},0.1)`, borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: attempted.percentage >= test.passing_score ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          Last Score: {Math.round(attempted.percentage)}% {attempted.percentage >= test.passing_score ? '✓ Passed' : '✗ Failed'}
                        </div>
                      )}

                      <Link to={`/student/tests/${test.id}`} className="btn-pp btn-pp-primary w-100" style={{ justifyContent: 'center', marginTop: 'auto' }}>
                        {attempted ? 'Retake Test' : 'Start Test'} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="pp-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Test Results History</h6>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No tests completed yet. Take your first mock test!</div>
          ) : (
            <div className="table-responsive">
              <table className="pp-table">
                <thead><tr><th>Test</th><th>Category</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{h.test_name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.category_name || 'General'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="pp-progress" style={{ width: 70 }}>
                            <div className="pp-progress-bar" style={{ width: `${h.percentage}%`, background: h.percentage >= 60 ? 'var(--gradient-success)' : 'var(--gradient-danger)' }}></div>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{Math.round(h.percentage)}%</span>
                        </div>
                      </td>
                      <td>
                        {h.percentage >= 60 ?
                          <span className="badge-pp badge-pp-success">✓ Passed</span> :
                          <span className="badge-pp badge-pp-danger">✗ Failed</span>}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.completed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const catColors = { technical: 'primary', hr: 'success', behavioral: 'warning', situational: 'info', coding: 'danger' };

export default function InterviewPrep() {
  const [questions, setQuestions] = useState([]);
  const [saved, setSaved] = useState([]);
  const [filters, setFilters] = useState({ category: '', difficulty: '' });
  const [activeTab, setActiveTab] = useState('browse');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
    api.get('/assessment/interview/saved').then(res => setSaved(res.data.questions)).catch(() => {});
  }, [filters]);

  const fetchQuestions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    api.get(`/assessment/interview/questions?${params}`).then(res => {
      setQuestions(res.data.questions);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const saveQuestion = async (qId) => {
    try {
      await api.post(`/assessment/interview/save/${qId}`, {});
      toast.success('Question saved!');
      const res = await api.get('/assessment/interview/saved');
      setSaved(res.data.questions);
    } catch {}
  };

  const isSaved = (qId) => saved.some(s => s.id === qId);

  const displayQuestions = activeTab === 'saved' ? saved : questions;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">💼 Interview Preparation</h1>
        <p className="page-subtitle">Practice technical and HR interview questions with sample answers and tips</p>
      </div>

      <div className="pp-tabs mb-4" style={{ width: 'fit-content' }}>
        <button className={`pp-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>Browse Questions ({questions.length})</button>
        <button className={`pp-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>Saved ({saved.length})</button>
      </div>

      {activeTab === 'browse' && (
        <div className="pp-card mb-4">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="pp-label">Category</label>
              <select className="pp-select w-100" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="behavioral">Behavioral</option>
                <option value="situational">Situational</option>
                <option value="coding">Coding</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="pp-label">Difficulty</label>
              <select className="pp-select w-100" value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}>
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn-pp btn-pp-outline w-100" style={{ justifyContent: 'center' }} onClick={() => setFilters({ category: '', difficulty: '' })}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="loading-spinner"></div></div>
      ) : displayQuestions.length === 0 ? (
        <div className="pp-card text-center py-5">
          <i className="bi bi-question-circle" style={{ fontSize: '3rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>{activeTab === 'saved' ? 'No saved questions yet. Browse and save questions you want to practice.' : 'No questions found with current filters.'}</p>
        </div>
      ) : (
        <div>
          {displayQuestions.map((q, i) => (
            <div key={q.id} className="pp-card mb-3">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div style={{ flex: 1 }}>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className={`badge-pp badge-pp-${catColors[q.category] || 'gray'}`}>{q.category?.toUpperCase()}</span>
                    <span className={`badge-pp badge-pp-${q.difficulty === 'easy' ? 'success' : q.difficulty === 'hard' ? 'danger' : 'warning'}`}>{q.difficulty}</span>
                    {q.topic && <span className="badge-pp badge-pp-gray">{q.topic}</span>}
                  </div>
                  <h6 style={{ fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.5 }}>{q.question_text}</h6>
                </div>
                <div className="d-flex gap-2 flex-shrink-0">
                  {!isSaved(q.id) && (
                    <button onClick={() => saveQuestion(q.id)} className="btn-pp btn-pp-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                      <i className="bi bi-bookmark me-1"></i>Save
                    </button>
                  )}
                  {isSaved(q.id) && <span className="badge-pp badge-pp-success">✓ Saved</span>}
                  <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="btn-pp btn-pp-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                    {expanded === q.id ? 'Hide' : 'View Answer'}
                  </button>
                </div>
              </div>

              {expanded === q.id && (
                <div className="animate-fade-up mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                  {q.sample_answer && (
                    <div className="mb-3">
                      <h6 style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>💬 Sample Answer</h6>
                      <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {q.sample_answer}
                      </div>
                    </div>
                  )}
                  {q.tips && (
                    <div>
                      <h6 style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>💡 Interview Tips</h6>
                      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {q.tips}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

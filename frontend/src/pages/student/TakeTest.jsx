import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/assessment/tests/${id}/questions`).then(res => {
      setTest(res.data.test);
      setQuestions(res.data.questions);
      setTimeLeft(res.data.test.duration_minutes * 60);
      setLoading(false);
    }).catch(() => navigate('/student/tests'));
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (test && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [test, submitted]);

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && Object.keys(answers).length < questions.length) {
      const confirmed = window.confirm(`You have answered ${Object.keys(answers).length} of ${questions.length} questions. Submit anyway?`);
      if (!confirmed) return;
    }
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res = await api.post(`/assessment/tests/${id}/submit`, { answers });
      setResult(res.data.result);
      setSubmitted(true);
      toast.success(`Test submitted! Score: ${res.data.result.percentage}%`);
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: 400 }}><div className="loading-spinner"></div></div>;

  if (submitted && result) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="pp-card text-center mb-4" style={{ background: result.passed ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)', borderColor: result.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{result.passed ? '🎉' : '😔'}</div>
          <h2 style={{ fontFamily: 'var(--font-display)' }}>{result.passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}</h2>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900, color: result.passed ? 'var(--accent-green)' : 'var(--accent-red)', margin: '1rem 0' }}>{result.percentage}%</div>
          <p style={{ color: 'var(--text-muted)' }}>Score: {result.score}/{result.totalMarks} · Passing: {result.passing_score}%</p>
          <div className="d-flex gap-3 justify-content-center mt-3">
            <button onClick={() => navigate('/student/tests')} className="btn-pp btn-pp-outline">← Back to Tests</button>
            <button onClick={() => window.location.reload()} className="btn-pp btn-pp-primary">Try Again</button>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="pp-card">
          <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Question Review</h5>
          {result.detailedResults.map((dr, i) => {
            const q = questions.find(q => q.id === dr.question_id);
            if (!q) return null;
            return (
              <div key={i} className="mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="d-flex gap-2 align-items-start mb-2">
                  <span style={{ background: dr.is_correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${dr.is_correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                    {dr.is_correct ? '✓' : '✗'}
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Q{i + 1}: {q.question_text}</div>
                </div>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optText = q[`option_${opt.toLowerCase()}`];
                  if (!optText) return null;
                  const isCorrect = opt === dr.correct;
                  const isSelected = opt === dr.selected;
                  return (
                    <div key={opt} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, marginBottom: '0.25rem', fontSize: '0.8rem', background: isCorrect ? 'rgba(16,185,129,0.1)' : isSelected && !isCorrect ? 'rgba(239,68,68,0.1)' : 'transparent', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : isSelected && !isCorrect ? 'rgba(239,68,68,0.3)' : 'transparent'}` }}>
                      <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{opt}.</span>{optText}
                      {isCorrect && <span style={{ marginLeft: '0.5rem', color: 'var(--accent-green)' }}>✓ Correct</span>}
                    </div>
                  );
                })}
                {dr.explanation && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(99,102,241,0.05)', borderRadius: 8 }}><i className="bi bi-lightbulb me-1" style={{ color: 'var(--accent)' }}></i>{dr.explanation}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="pp-card mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 style={{ fontWeight: 700, margin: 0 }}>{test?.title}</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{questions.length} Questions</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div style={{ background: timeLeft < 120 ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${timeLeft < 120 ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`, borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: timeLeft < 120 ? 'var(--accent-red)' : 'var(--primary-light)' }}>
              <i className="bi bi-clock me-2"></i>{formatTime(timeLeft)}
            </div>
            <button onClick={() => handleSubmit(false)} className="btn-pp btn-pp-success" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
        <div className="pp-progress mt-3">
          <div className="pp-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{Object.keys(answers).length}/{questions.length} answered</div>
      </div>

      <div className="row g-4">
        {/* Question */}
        <div className="col-lg-8">
          {q && (
            <div className="pp-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Question {currentQ + 1} of {questions.length}</span>
                <span className={`badge-pp badge-pp-${q.difficulty === 'easy' ? 'success' : q.difficulty === 'hard' ? 'danger' : 'warning'}`}>{q.difficulty}</span>
              </div>
              <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.6 }}>{q.question_text}</h5>
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = q[`option_${opt.toLowerCase()}`];
                if (!optText) return null;
                return (
                  <button key={opt} className={`option-btn ${answers[q.id] === opt ? 'selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}>
                    <span className="option-letter">{opt}</span>
                    {optText}
                  </button>
                );
              })}
              <div className="d-flex justify-content-between mt-4">
                <button className="btn-pp btn-pp-outline" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>← Previous</button>
                <button className="btn-pp btn-pp-primary" disabled={currentQ === questions.length - 1} onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Question navigator */}
        <div className="col-lg-4">
          <div className="pp-card">
            <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Question Navigator</h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  style={{ width: '100%', aspectRatio: '1', border: `1px solid ${i === currentQ ? 'var(--primary)' : answers[questions[i]?.id] ? 'var(--accent-green)' : 'var(--border-light)'}`, borderRadius: 'var(--radius-sm)', background: i === currentQ ? 'rgba(99,102,241,0.2)' : answers[questions[i]?.id] ? 'rgba(16,185,129,0.1)' : 'transparent', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-3" style={{ fontSize: '0.75rem' }}>
              <div className="d-flex gap-3">
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(16,185,129,0.5)', marginRight: 4 }}></span>Answered</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(99,102,241,0.5)', marginRight: 4 }}></span>Current</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.1)', marginRight: 4 }}></span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

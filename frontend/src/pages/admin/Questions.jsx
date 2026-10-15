import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminQuestions() {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState('add_question');

  // Question Form
  const [qForm, setQForm] = useState({
    category_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    difficulty: 'medium',
    tags: ''
  });

  // Test Form
  const [tForm, setTForm] = useState({
    title: '',
    description: '',
    category_id: '',
    duration_minutes: '30',
    total_questions: '20',
    passing_score: '60',
    difficulty: 'mixed'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [catRes, testRes] = await Promise.all([
        api.get('/assessment/categories'),
        api.get('/assessment/tests')
      ]);
      setCategories(catRes.data.categories || []);
      setTests(testRes.data.tests || []);
      if (catRes.data.categories?.length > 0) {
        setQForm(prev => ({ ...prev, category_id: catRes.data.categories[0].id }));
        setTForm(prev => ({ ...prev, category_id: catRes.data.categories[0].id }));
      }
    } catch {}
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qForm.question_text || !qForm.option_a || !qForm.option_b) {
      toast.error('Question text and at least options A & B are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/questions', qForm);
      toast.success('Question added to assessment bank!');
      setQForm({
        ...qForm,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        tags: ''
      });
    } catch (err) {
      toast.error('Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!tForm.title) {
      toast.error('Test title is required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/tests', tForm);
      toast.success('Mock Test created successfully!');
      setTForm({
        title: '',
        description: '',
        category_id: categories[0]?.id || '',
        duration_minutes: '30',
        total_questions: '20',
        passing_score: '60',
        difficulty: 'mixed'
      });
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to create mock test.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">📝 Assessment & Question Bank Manager</h1>
          <p className="page-subtitle">Curate aptitude, reasoning, and technical MCQs; configure timed mock assessment suites</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="pp-tabs mb-4">
        <button
          className={`pp-tab ${activeTab === 'add_question' ? 'active' : ''}`}
          onClick={() => setActiveTab('add_question')}
        >
          <i className="bi bi-patch-question me-1"></i> Add Question to Bank
        </button>
        <button
          className={`pp-tab ${activeTab === 'create_test' ? 'active' : ''}`}
          onClick={() => setActiveTab('create_test')}
        >
          <i className="bi bi-plus-circle me-1"></i> Create Mock Test
        </button>
        <button
          className={`pp-tab ${activeTab === 'existing_tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('existing_tests')}
        >
          <i className="bi bi-journal-text me-1"></i> Available Mock Tests ({tests.length})
        </button>
      </div>

      {/* TAB 1: ADD QUESTION */}
      {activeTab === 'add_question' && (
        <div className="pp-card" style={{ maxWidth: 850 }}>
          <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Add MCQ to Question Bank</h5>
          <form onSubmit={handleCreateQuestion} className="row g-3">
            <div className="col-md-6">
              <label className="form-label-pp">Category *</label>
              <select
                className="form-select-pp"
                value={qForm.category_id}
                onChange={e => setQForm({ ...qForm, category_id: e.target.value })}
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label-pp">Difficulty Level</label>
              <select
                className="form-select-pp"
                value={qForm.difficulty}
                onChange={e => setQForm({ ...qForm, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label-pp">Question Statement *</label>
              <textarea
                rows="3"
                className="form-control-pp"
                placeholder="Write the full question statement..."
                value={qForm.question_text}
                onChange={e => setQForm({ ...qForm, question_text: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="col-md-6">
              <label className="form-label-pp">Option A *</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="Option A text"
                value={qForm.option_a}
                onChange={e => setQForm({ ...qForm, option_a: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label-pp">Option B *</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="Option B text"
                value={qForm.option_b}
                onChange={e => setQForm({ ...qForm, option_b: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label-pp">Option C</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="Option C text"
                value={qForm.option_c}
                onChange={e => setQForm({ ...qForm, option_c: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label-pp">Option D</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="Option D text"
                value={qForm.option_d}
                onChange={e => setQForm({ ...qForm, option_d: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Correct Answer *</label>
              <select
                className="form-select-pp"
                value={qForm.correct_answer}
                onChange={e => setQForm({ ...qForm, correct_answer: e.target.value })}
                required
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="col-md-8">
              <label className="form-label-pp">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="e.g. algorithms, time-complexity, java"
                value={qForm.tags}
                onChange={e => setQForm({ ...qForm, tags: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label-pp">Answer Explanation & Rationale</label>
              <textarea
                rows="2"
                className="form-control-pp"
                placeholder="Explain why this option is correct to aid student learning..."
                value={qForm.explanation}
                onChange={e => setQForm({ ...qForm, explanation: e.target.value })}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" disabled={saving} className="btn-pp btn-pp-primary">
                {saving ? <span className="loading-spinner me-2" style={{ width: 16, height: 16 }}></span> : <i className="bi bi-plus-lg me-1"></i>}
                Save Question to Repository
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CREATE MOCK TEST */}
      {activeTab === 'create_test' && (
        <div className="pp-card" style={{ maxWidth: 850 }}>
          <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Assemble New Mock Test</h5>
          <form onSubmit={handleCreateTest} className="row g-3">
            <div className="col-md-6">
              <label className="form-label-pp">Test Title *</label>
              <input
                type="text"
                className="form-control-pp"
                placeholder="e.g. Full-Stack Engineering Mock 2025"
                value={tForm.title}
                onChange={e => setTForm({ ...tForm, title: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label-pp">Category</label>
              <select
                className="form-select-pp"
                value={tForm.category_id}
                onChange={e => setTForm({ ...tForm, category_id: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Duration (Minutes)</label>
              <input
                type="number"
                className="form-control-pp"
                value={tForm.duration_minutes}
                onChange={e => setTForm({ ...tForm, duration_minutes: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Number of Questions</label>
              <input
                type="number"
                className="form-control-pp"
                value={tForm.total_questions}
                onChange={e => setTForm({ ...tForm, total_questions: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label-pp">Passing Score (%)</label>
              <input
                type="number"
                className="form-control-pp"
                value={tForm.passing_score}
                onChange={e => setTForm({ ...tForm, passing_score: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label-pp">Difficulty Profile</label>
              <select
                className="form-select-pp"
                value={tForm.difficulty}
                onChange={e => setTForm({ ...tForm, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label-pp">Test Overview / Instructions</label>
              <textarea
                rows="3"
                className="form-control-pp"
                placeholder="Provide directions for candidates taking this assessment..."
                value={tForm.description}
                onChange={e => setTForm({ ...tForm, description: e.target.value })}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" disabled={saving} className="btn-pp btn-pp-primary">
                {saving ? <span className="loading-spinner me-2" style={{ width: 16, height: 16 }}></span> : <i className="bi bi-check-lg me-1"></i>}
                Publish Mock Test
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: EXISTING MOCK TESTS */}
      {activeTab === 'existing_tests' && (
        <div className="row g-4">
          {tests.length === 0 ? (
            <div className="col-12">
              <div className="pp-card text-center py-5">
                <i className="bi bi-journal-x" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                <h6 className="mt-3">No mock tests configured yet.</h6>
              </div>
            </div>
          ) : (
            tests.map(t => (
              <div className="col-md-6 col-xl-4" key={t.id}>
                <div className="pp-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge-pp badge-pp-primary" style={{ fontSize: '0.7rem' }}>
                        {t.category_name || 'General'}
                      </span>
                      <span className="badge-pp badge-pp-warning" style={{ fontSize: '0.7rem' }}>
                        {t.difficulty}
                      </span>
                    </div>
                    <h5 style={{ fontWeight: 700 }}>{t.title}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {t.description || 'Standard placement evaluation assessment.'}
                    </p>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 mt-3" style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>
                      <i className="bi bi-clock me-1"></i> {t.duration_minutes} Mins
                    </div>
                    <div>
                      <i className="bi bi-question-circle me-1"></i> {t.total_questions} Questions
                    </div>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                      Pass: {t.passing_score}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

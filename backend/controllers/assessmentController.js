const { pool } = require('../config/db');

// GET /api/assessment/categories
const getCategories = async (req, res) => {
  try {
    const [cats] = await pool.query('SELECT * FROM assessment_categories ORDER BY name');
    res.json({ success: true, categories: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/assessment/tests
const getTests = async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT mt.*, ac.name as category_name FROM mock_tests mt LEFT JOIN assessment_categories ac ON mt.category_id = ac.id WHERE mt.is_active = 1';
    const params = [];
    if (category_id) { query += ' AND mt.category_id = ?'; params.push(category_id); }
    query += ' ORDER BY mt.created_at DESC';
    const [tests] = await pool.query(query, params);
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/assessment/tests/:id/questions
const getTestQuestions = async (req, res) => {
  try {
    const [tests] = await pool.query('SELECT * FROM mock_tests WHERE id = ?', [req.params.id]);
    if (tests.length === 0) return res.status(404).json({ success: false, message: 'Test not found.' });
    const test = tests[0];

    const [questions] = await pool.query(
      `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.difficulty, q.tags
       FROM questions q WHERE q.category_id = ? ORDER BY RAND() LIMIT ?`,
      [test.category_id, test.total_questions]
    );

    res.json({ success: true, test, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/assessment/tests/:id/submit
const submitTest = async (req, res) => {
  const { answers } = req.body; // { questionId: selectedAnswer }
  const testId = req.params.id;
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });
    const studentId = sp[0].id;

    const [tests] = await pool.query('SELECT * FROM mock_tests WHERE id = ?', [testId]);
    if (tests.length === 0) return res.status(404).json({ success: false, message: 'Test not found.' });
    const test = tests[0];

    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) return res.status(400).json({ success: false, message: 'No answers provided.' });

    const [questions] = await pool.query(
      `SELECT id, correct_answer, explanation FROM questions WHERE id IN (${questionIds.map(() => '?').join(',')})`,
      questionIds
    );

    let score = 0;
    const detailedResults = questions.map(q => {
      const isCorrect = answers[q.id] === q.correct_answer;
      if (isCorrect) score++;
      return { question_id: q.id, selected: answers[q.id], correct: q.correct_answer, is_correct: isCorrect, explanation: q.explanation };
    });

    const totalMarks = questions.length;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    const [result] = await pool.query(
      `INSERT INTO test_attempts (student_id, test_id, score, total_marks, percentage, status, answers, completed_at)
       VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW())`,
      [studentId, testId, score, totalMarks, percentage, JSON.stringify(detailedResults)]
    );

    const passed = percentage >= test.passing_score;

    res.json({
      success: true,
      result: {
        attempt_id: result.insertId,
        score,
        totalMarks,
        percentage,
        passed,
        passing_score: test.passing_score,
        detailedResults
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/assessment/history
const getTestHistory = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const [history] = await pool.query(
      `SELECT ta.*, mt.title as test_name, ac.name as category_name
       FROM test_attempts ta
       JOIN mock_tests mt ON ta.test_id = mt.id
       LEFT JOIN assessment_categories ac ON mt.category_id = ac.id
       WHERE ta.student_id = ? AND ta.status = 'completed'
       ORDER BY ta.completed_at DESC LIMIT 30`,
      [sp[0].id]
    );
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/interview/questions
const getInterviewQuestions = async (req, res) => {
  try {
    const { category, difficulty, topic, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM interview_questions WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (difficulty) { query += ' AND difficulty = ?'; params.push(difficulty); }
    if (topic) { query += ' AND topic LIKE ?'; params.push(`%${topic}%`); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [questions] = await pool.query(query, params);
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/interview/save/:questionId
const saveInterviewQuestion = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query(
      'INSERT IGNORE INTO saved_interview_questions (student_id, question_id, notes) VALUES (?, ?, ?)',
      [sp[0].id, req.params.questionId, req.body.notes || null]
    );
    res.json({ success: true, message: 'Question saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/interview/saved
const getSavedQuestions = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [saved] = await pool.query(
      `SELECT iq.*, siq.notes, siq.saved_at FROM saved_interview_questions siq
       JOIN interview_questions iq ON siq.question_id = iq.id
       WHERE siq.student_id = ? ORDER BY siq.saved_at DESC`,
      [sp[0].id]
    );
    res.json({ success: true, questions: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCategories, getTests, getTestQuestions, submitTest, getTestHistory, getInterviewQuestions, saveInterviewQuestion, getSavedQuestions };

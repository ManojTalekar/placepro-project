const { pool } = require('../config/db');

// GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'");
    const [[{ totalCompanies }]] = await pool.query("SELECT COUNT(*) as totalCompanies FROM companies");
    const [[{ totalDrives }]] = await pool.query("SELECT COUNT(*) as totalDrives FROM placement_drives");
    const [[{ openDrives }]] = await pool.query("SELECT COUNT(*) as openDrives FROM placement_drives WHERE status = 'open'");
    const [[{ totalApplications }]] = await pool.query("SELECT COUNT(*) as totalApplications FROM applications");
    const [[{ placedStudents }]] = await pool.query("SELECT COUNT(*) as placedStudents FROM student_profiles WHERE placement_status = 'placed'");
    const [[{ shortlisted }]] = await pool.query("SELECT COUNT(*) as shortlisted FROM applications WHERE status = 'shortlisted'");
    const [[{ selected }]] = await pool.query("SELECT COUNT(*) as selected FROM applications WHERE status = 'selected'");

    // Department wise placements
    const [deptStats] = await pool.query(
      `SELECT sp.department, COUNT(*) as total,
              SUM(CASE WHEN sp.placement_status = 'placed' THEN 1 ELSE 0 END) as placed
       FROM student_profiles sp WHERE sp.department IS NOT NULL
       GROUP BY sp.department ORDER BY total DESC LIMIT 10`
    );

    // Recent applications
    const [recentApps] = await pool.query(
      `SELECT a.*, u.name as student_name, pd.title as drive_title, c.name as company_name
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       ORDER BY a.applied_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      dashboard: {
        stats: { totalStudents, totalCompanies, totalDrives, openDrives, totalApplications, placedStudents, shortlisted, selected },
        deptStats,
        recentApplications: recentApps
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/students
const getAllStudents = async (req, res) => {
  try {
    const { search, department, placement_status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT sp.*, u.name, u.email, u.is_active FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE 1=1`;
    const params = [];
    if (search) { query += ' AND (u.name LIKE ? OR u.email LIKE ? OR sp.roll_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (department) { query += ' AND sp.department = ?'; params.push(department); }
    if (placement_status) { query += ' AND sp.placement_status = ?'; params.push(placement_status); }
    query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [students] = await pool.query(query, params);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE 1=1');
    res.json({ success: true, students, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/students/:id/placement-status
const updatePlacementStatus = async (req, res) => {
  const { placement_status } = req.body;
  try {
    await pool.query('UPDATE student_profiles SET placement_status=? WHERE id=?', [placement_status, req.params.id]);
    res.json({ success: true, message: 'Placement status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/companies
const getAllCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query('SELECT * FROM companies ORDER BY name');
    res.json({ success: true, companies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/admin/companies
const createCompany = async (req, res) => {
  const { name, industry, website, logo_url, description, headquarters, company_size } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO companies (name, industry, website, logo_url, description, headquarters, company_size, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, industry, website, logo_url, description, headquarters, company_size, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Company created.', company_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/companies/:id
const updateCompany = async (req, res) => {
  const { name, industry, website, logo_url, description, headquarters, company_size } = req.body;
  try {
    await pool.query(
      'UPDATE companies SET name=?, industry=?, website=?, logo_url=?, description=?, headquarters=?, company_size=? WHERE id=?',
      [name, industry, website, logo_url, description, headquarters, company_size, req.params.id]
    );
    res.json({ success: true, message: 'Company updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/reports/placement
const getPlacementReport = async (req, res) => {
  try {
    const [deptWise] = await pool.query(
      `SELECT sp.department,
              COUNT(*) as total_students,
              SUM(CASE WHEN sp.placement_status='placed' THEN 1 ELSE 0 END) as placed,
              AVG(sp.cgpa) as avg_cgpa,
              COUNT(DISTINCT a.drive_id) as drives_participated
       FROM student_profiles sp
       LEFT JOIN applications a ON sp.id = a.student_id
       GROUP BY sp.department ORDER BY placed DESC`
    );

    const [companyWise] = await pool.query(
      `SELECT c.name as company, COUNT(a.id) as total_applications,
              SUM(CASE WHEN a.status='selected' THEN 1 ELSE 0 END) as selected,
              SUM(CASE WHEN a.status='shortlisted' THEN 1 ELSE 0 END) as shortlisted
       FROM companies c
       LEFT JOIN placement_drives pd ON c.id = pd.company_id
       LEFT JOIN applications a ON pd.id = a.drive_id
       GROUP BY c.id ORDER BY selected DESC LIMIT 20`
    );

    const [testPerformance] = await pool.query(
      `SELECT mt.title, COUNT(ta.id) as attempts, AVG(ta.percentage) as avg_score,
              MAX(ta.percentage) as max_score, MIN(ta.percentage) as min_score
       FROM mock_tests mt
       LEFT JOIN test_attempts ta ON mt.id = ta.test_id AND ta.status='completed'
       GROUP BY mt.id ORDER BY attempts DESC`
    );

    res.json({ success: true, report: { deptWise, companyWise, testPerformance } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Create assessment questions
const createQuestion = async (req, res) => {
  const { category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, tags } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty || 'medium', tags]
    );
    res.status(201).json({ success: true, message: 'Question created.', question_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Create mock test
const createMockTest = async (req, res) => {
  const { title, description, category_id, duration_minutes, total_questions, passing_score, difficulty } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO mock_tests (title, description, category_id, duration_minutes, total_questions, passing_score, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, category_id, duration_minutes || 30, total_questions || 20, passing_score || 60, difficulty || 'mixed']
    );
    res.status(201).json({ success: true, message: 'Mock test created.', test_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Send notification to all students
const sendNotification = async (req, res) => {
  const { title, message, notification_type } = req.body;
  try {
    const [students] = await pool.query("SELECT id FROM users WHERE role = 'student'");
    for (const s of students) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
        [s.id, title, message, notification_type || 'info']
      );
    }
    res.json({ success: true, message: `Notification sent to ${students.length} students.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAdminDashboard, getAllStudents, updatePlacementStatus, getAllCompanies, createCompany, updateCompany, getPlacementReport, createQuestion, createMockTest, sendNotification };

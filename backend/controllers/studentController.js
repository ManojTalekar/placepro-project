const { pool } = require('../config/db');

// GET /api/student/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.profile_picture
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const profile = rows[0];
    // Fetch skills
    const [skills] = await pool.query('SELECT * FROM student_skills WHERE student_id = ?', [profile.id]);
    // Fetch projects
    const [projects] = await pool.query('SELECT * FROM student_projects WHERE student_id = ?', [profile.id]);
    // Fetch certifications
    const [certs] = await pool.query('SELECT * FROM student_certifications WHERE student_id = ?', [profile.id]);
    // Fetch resumes
    const [resumes] = await pool.query('SELECT * FROM resumes WHERE student_id = ?', [profile.id]);

    res.json({ success: true, profile: { ...profile, skills, projects, certifications: certs, resumes } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/student/profile
const updateProfile = async (req, res) => {
  const {
    roll_number, phone, date_of_birth, gender, address,
    college, department, degree, specialization, graduation_year,
    cgpa, backlogs, tenth_percentage, twelfth_percentage,
    linkedin_url, github_url, portfolio_url, bio
  } = req.body;
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    await pool.query(
      `UPDATE student_profiles SET
        roll_number=?, phone=?, date_of_birth=?, gender=?, address=?,
        college=?, department=?, degree=?, specialization=?, graduation_year=?,
        cgpa=?, backlogs=?, tenth_percentage=?, twelfth_percentage=?,
        linkedin_url=?, github_url=?, portfolio_url=?, bio=?
       WHERE user_id=?`,
      [roll_number, phone, date_of_birth, gender, address,
        college, department, degree, specialization, graduation_year,
        cgpa, backlogs, tenth_percentage, twelfth_percentage,
        linkedin_url, github_url, portfolio_url, bio, req.user.id]
    );
    // Update user name if provided
    if (req.body.name) {
      await pool.query('UPDATE users SET name=? WHERE id=?', [req.body.name, req.user.id]);
    }
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/student/skills
const addSkill = async (req, res) => {
  const { skill_name, skill_type, proficiency } = req.body;
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const [result] = await pool.query(
      'INSERT INTO student_skills (student_id, skill_name, skill_type, proficiency) VALUES (?, ?, ?, ?)',
      [sp[0].id, skill_name, skill_type || 'technical', proficiency || 'intermediate']
    );
    res.status(201).json({ success: true, message: 'Skill added.', skill_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/student/skills/:id
const deleteSkill = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query('DELETE FROM student_skills WHERE id=? AND student_id=?', [req.params.id, sp[0].id]);
    res.json({ success: true, message: 'Skill removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/student/projects
const addProject = async (req, res) => {
  const { title, description, tech_stack, project_url, github_url, start_date, end_date } = req.body;
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [result] = await pool.query(
      'INSERT INTO student_projects (student_id, title, description, tech_stack, project_url, github_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sp[0].id, title, description, tech_stack, project_url, github_url, start_date, end_date]
    );
    res.status(201).json({ success: true, message: 'Project added.', project_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/student/projects/:id
const deleteProject = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query('DELETE FROM student_projects WHERE id=? AND student_id=?', [req.params.id, sp[0].id]);
    res.json({ success: true, message: 'Project removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/student/certifications
const addCertification = async (req, res) => {
  const { title, issuer, issue_date, expiry_date, credential_id, credential_url } = req.body;
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [result] = await pool.query(
      'INSERT INTO student_certifications (student_id, title, issuer, issue_date, expiry_date, credential_id, credential_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sp[0].id, title, issuer, issue_date, expiry_date, credential_id, credential_url]
    );
    res.status(201).json({ success: true, message: 'Certification added.', cert_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/student/certifications/:id
const deleteCertification = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query('DELETE FROM student_certifications WHERE id=? AND student_id=?', [req.params.id, sp[0].id]);
    res.json({ success: true, message: 'Certification removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/student/dashboard
const getDashboard = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });
    const studentId = sp[0].id;

    const [[{ totalApps }]] = await pool.query('SELECT COUNT(*) as totalApps FROM applications WHERE student_id = ?', [studentId]);
    const [[{ shortlisted }]] = await pool.query("SELECT COUNT(*) as shortlisted FROM applications WHERE student_id = ? AND status = 'shortlisted'", [studentId]);
    const [[{ selected }]] = await pool.query("SELECT COUNT(*) as selected FROM applications WHERE student_id = ? AND status = 'selected'", [studentId]);
    const [[{ testCount }]] = await pool.query("SELECT COUNT(*) as testCount FROM test_attempts WHERE student_id = ? AND status = 'completed'", [studentId]);
    const [[{ avgScore }]] = await pool.query("SELECT AVG(percentage) as avgScore FROM test_attempts WHERE student_id = ? AND status = 'completed'", [studentId]);
    const [[{ openDrives }]] = await pool.query("SELECT COUNT(*) as openDrives FROM placement_drives WHERE status = 'open' AND application_deadline >= CURDATE()", []);

    // Recent applications
    const [recentApps] = await pool.query(
      `SELECT a.*, pd.title as drive_title, c.name as company_name, c.logo_url
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC LIMIT 5`,
      [studentId]
    );

    // Upcoming drives
    const [upcomingDrives] = await pool.query(
      `SELECT pd.*, c.name as company_name, c.logo_url
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       WHERE pd.status = 'open' AND pd.application_deadline >= CURDATE()
       ORDER BY pd.application_deadline ASC LIMIT 5`
    );

    res.json({
      success: true,
      dashboard: {
        stats: { totalApps, shortlisted, selected, testCount, avgScore: Math.round(avgScore || 0), openDrives },
        recentApplications: recentApps,
        upcomingDrives,
        profile: sp[0]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, addSkill, deleteSkill, addProject, deleteProject, addCertification, deleteCertification, getDashboard };

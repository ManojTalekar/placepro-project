const { pool } = require('../config/db');

// GET /api/drives - all open drives with eligibility check
const getAllDrives = async (req, res) => {
  try {
    const { status, company, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT pd.*, c.name as company_name, c.logo_url, c.industry
                 FROM placement_drives pd
                 JOIN companies c ON pd.company_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND pd.status = ?'; params.push(status); }
    if (company) { query += ' AND c.name LIKE ?'; params.push(`%${company}%`); }
    if (search) { query += ' AND (pd.title LIKE ? OR pd.job_description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY pd.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [drives] = await pool.query(query, params);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM placement_drives pd JOIN companies c ON pd.company_id = c.id WHERE 1=1');

    res.json({ success: true, drives, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/drives/:id
const getDriveById = async (req, res) => {
  try {
    const [drives] = await pool.query(
      `SELECT pd.*, c.name as company_name, c.logo_url, c.industry, c.website, c.description as company_description
       FROM placement_drives pd JOIN companies c ON pd.company_id = c.id WHERE pd.id = ?`,
      [req.params.id]
    );
    if (drives.length === 0) return res.status(404).json({ success: false, message: 'Drive not found.' });
    res.json({ success: true, drive: drives[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/drives/:id/apply
const applyToDrive = async (req, res) => {
  const { cover_letter, resume_id } = req.body;
  const driveId = req.params.id;
  try {
    const [sp] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found.' });
    const student = sp[0];

    // Check if already applied
    const [existing] = await pool.query('SELECT id FROM applications WHERE drive_id=? AND student_id=?', [driveId, student.id]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'You have already applied to this drive.' });

    // Check eligibility
    const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [driveId]);
    if (drives.length === 0) return res.status(404).json({ success: false, message: 'Drive not found.' });
    const drive = drives[0];

    if (drive.status !== 'open') return res.status(400).json({ success: false, message: 'Applications are not open for this drive.' });
    if (drive.application_deadline && new Date(drive.application_deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed.' });
    }

    // Eligibility checks
    const eligibilityErrors = [];
    if (drive.min_cgpa && parseFloat(drive.min_cgpa) > 0) {
      if (!student.cgpa) {
        eligibilityErrors.push(`Please set your CGPA in Profile (Minimum ${drive.min_cgpa} required)`);
      } else if (parseFloat(student.cgpa) < parseFloat(drive.min_cgpa)) {
        eligibilityErrors.push(`Minimum CGPA required: ${drive.min_cgpa} (Your CGPA: ${student.cgpa})`);
      }
    }
    if (drive.max_backlogs !== null && drive.max_backlogs !== undefined) {
      const studentBacklogs = parseInt(student.backlogs || 0);
      if (studentBacklogs > parseInt(drive.max_backlogs)) {
        eligibilityErrors.push(`Maximum active backlogs allowed: ${drive.max_backlogs} (You have: ${studentBacklogs})`);
      }
    }
    if (drive.required_degree && drive.required_degree.trim() !== '') {
      const reqDeg = drive.required_degree.toLowerCase().trim();
      const stuDeg = student.degree ? student.degree.toLowerCase().trim() : '';
      if (!stuDeg) {
        eligibilityErrors.push(`Please set your Degree in Profile (Required: ${drive.required_degree})`);
      } else if (!stuDeg.includes(reqDeg) && !reqDeg.includes(stuDeg)) {
        eligibilityErrors.push(`Required degree: ${drive.required_degree} (Your degree: ${student.degree})`);
      }
    }
    if (drive.required_departments && drive.required_departments.trim() !== '') {
      const requiredDepts = drive.required_departments.split(',').map(d => d.trim().toLowerCase());
      const stuDept = student.department ? student.department.toLowerCase().trim() : '';
      const hasDept = stuDept && requiredDepts.some(d => stuDept.includes(d) || d.includes(stuDept));
      if (!hasDept) {
        eligibilityErrors.push(`Eligible departments: ${drive.required_departments} (Your department: ${student.department || 'Not set'})`);
      }
    }
    if (drive.graduation_year_from && drive.graduation_year_from > 0 && student.graduation_year && student.graduation_year < drive.graduation_year_from) {
      eligibilityErrors.push(`Graduation year must be >= ${drive.graduation_year_from} (Yours: ${student.graduation_year})`);
    }
    if (drive.graduation_year_to && drive.graduation_year_to > 0 && student.graduation_year && student.graduation_year > drive.graduation_year_to) {
      eligibilityErrors.push(`Graduation year must be <= ${drive.graduation_year_to} (Yours: ${student.graduation_year})`);
    }

    if (eligibilityErrors.length > 0) {
      return res.status(400).json({ success: false, message: 'You are not eligible for this drive.', errors: eligibilityErrors });
    }

    const [result] = await pool.query(
      'INSERT INTO applications (drive_id, student_id, resume_id, cover_letter) VALUES (?, ?, ?, ?)',
      [driveId, student.id, resume_id || null, cover_letter || null]
    );

    // Create notification
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, notification_type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, 'Application Submitted', `Your application for "${drive.title}" has been submitted successfully.`, 'application', result.insertId, 'application']
    );

    res.status(201).json({ success: true, message: 'Application submitted successfully.', application_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/drives/check-eligibility/:id
const checkEligibility = async (req, res) => {
  const driveId = req.params.id;
  try {
    const [sp] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });
    const student = sp[0];

    const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [driveId]);
    if (drives.length === 0) return res.status(404).json({ success: false, message: 'Drive not found.' });
    const drive = drives[0];

    const criteria = [];
    let isEligible = true;

    // CGPA check
    if (drive.min_cgpa && parseFloat(drive.min_cgpa) > 0) {
      const passed = student.cgpa ? parseFloat(student.cgpa) >= parseFloat(drive.min_cgpa) : false;
      criteria.push({ criterion: 'Minimum CGPA', required: drive.min_cgpa, actual: student.cgpa || 'Not set', passed });
      if (!passed) isEligible = false;
    }
    // Backlogs check
    if (drive.max_backlogs !== null && drive.max_backlogs !== undefined) {
      const studentBacklogs = parseInt(student.backlogs || 0);
      const passed = studentBacklogs <= parseInt(drive.max_backlogs);
      criteria.push({ criterion: 'Maximum Backlogs', required: drive.max_backlogs, actual: studentBacklogs, passed });
      if (!passed) isEligible = false;
    }
    // Degree check
    if (drive.required_degree && drive.required_degree.trim() !== '') {
      const reqDeg = drive.required_degree.toLowerCase().trim();
      const stuDeg = student.degree ? student.degree.toLowerCase().trim() : '';
      const passed = stuDeg ? (stuDeg.includes(reqDeg) || reqDeg.includes(stuDeg)) : false;
      criteria.push({ criterion: 'Required Degree', required: drive.required_degree, actual: student.degree || 'Not set', passed });
      if (!passed) isEligible = false;
    }
    // Graduation year check
    if ((drive.graduation_year_from && drive.graduation_year_from > 0) || (drive.graduation_year_to && drive.graduation_year_to > 0)) {
      const fromPassed = !drive.graduation_year_from || (student.graduation_year && student.graduation_year >= drive.graduation_year_from);
      const toPassed = !drive.graduation_year_to || (student.graduation_year && student.graduation_year <= drive.graduation_year_to);
      const passed = Boolean(fromPassed && toPassed);
      criteria.push({ criterion: 'Graduation Year', required: `${drive.graduation_year_from || 'any'} - ${drive.graduation_year_to || 'any'}`, actual: student.graduation_year || 'Not set', passed });
      if (!passed) isEligible = false;
    }

    // Department check
    if (drive.required_departments && drive.required_departments.trim() !== '') {
      const requiredDepts = drive.required_departments.split(',').map(d => d.trim().toLowerCase());
      const stuDept = student.department ? student.department.toLowerCase().trim() : '';
      const passed = stuDept ? requiredDepts.some(d => stuDept.includes(d) || d.includes(stuDept)) : false;
      criteria.push({ criterion: 'Required Department', required: drive.required_departments, actual: student.department || 'Not set', passed });
      if (!passed) isEligible = false;
    }

    // Check if already applied
    const [existing] = await pool.query('SELECT id FROM applications WHERE drive_id=? AND student_id=?', [driveId, student.id]);
    const alreadyApplied = existing.length > 0;

    res.json({ success: true, eligibility: { isEligible, alreadyApplied, criteria, drive: { id: drive.id, title: drive.title, status: drive.status } } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/drives/my-applications
const getMyApplications = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const [apps] = await pool.query(
      `SELECT a.*, pd.title as drive_title, pd.job_type, pd.location, pd.salary_min, pd.salary_max,
              c.name as company_name, c.logo_url, c.industry
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [sp[0].id]
    );
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin / Recruiter: POST /api/drives
const createDrive = async (req, res) => {
  const {
    company_id, title, job_description, job_type, location,
    salary_min, salary_max, required_skills, min_cgpa, max_backlogs,
    required_degree, required_departments, graduation_year_from, graduation_year_to,
    application_deadline, drive_date, openings, status
  } = req.body;
  try {
    const driveStatus = status || 'open';
    const deadline = application_deadline ? new Date(application_deadline).toISOString().slice(0, 10) : null;
    const driveDt = drive_date ? new Date(drive_date).toISOString().slice(0, 10) : null;

    const [result] = await pool.query(
      `INSERT INTO placement_drives (company_id, title, job_description, job_type, location,
       salary_min, salary_max, required_skills, min_cgpa, max_backlogs, required_degree, required_departments,
       graduation_year_from, graduation_year_to, application_deadline, drive_date, openings, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        title,
        job_description || '',
        job_type || 'full_time',
        location || '',
        salary_min || 0,
        salary_max || 0,
        required_skills || '',
        min_cgpa || 0,
        max_backlogs || 0,
        required_degree || null,
        required_departments || null,
        graduation_year_from ? parseInt(graduation_year_from) : null,
        graduation_year_to ? parseInt(graduation_year_to) : null,
        deadline,
        driveDt,
        openings || 1,
        req.user.id,
        driveStatus
      ]
    );

    // Notify all students
    const [students] = await pool.query("SELECT user_id FROM student_profiles");
    for (const s of students) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
        [s.user_id, 'New Placement Drive Posted', `${title} is now available (${driveStatus.toUpperCase()}). Check your eligibility and apply!`, 'drive', result.insertId, 'drive']
      );
    }

    res.status(201).json({ success: true, message: 'Placement drive created.', drive_id: result.insertId });
  } catch (err) {
    console.error('Create drive error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// Admin / Recruiter: PUT /api/drives/:id
const updateDrive = async (req, res) => {
  try {
    const { status, title, application_deadline, openings } = req.body;
    const [existing] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Drive not found.' });

    const current = existing[0];
    const newStatus = status || current.status;
    const newTitle = title !== undefined ? title : current.title;
    
    let newDeadline = current.application_deadline;
    if (application_deadline) {
      newDeadline = new Date(application_deadline).toISOString().slice(0, 10);
    }
    const newOpenings = openings !== undefined ? openings : current.openings;

    await pool.query(
      'UPDATE placement_drives SET status=?, title=?, application_deadline=?, openings=? WHERE id=?',
      [newStatus, newTitle, newDeadline, newOpenings, req.params.id]
    );
    res.json({ success: true, message: 'Drive updated successfully.', status: newStatus });
  } catch (err) {
    console.error('Update drive error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// Admin: GET /api/drives/:id/applications
const getDriveApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(
      `SELECT a.*, u.name as student_name, u.email as student_email,
              sp.cgpa, sp.department, sp.college, sp.phone, sp.backlogs
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       WHERE a.drive_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: PUT /api/drives/applications/:appId/status
const updateApplicationStatus = async (req, res) => {
  const { status, recruiter_notes, interview_date, interview_mode, interview_link } = req.body;
  try {
    await pool.query(
      'UPDATE applications SET status=?, recruiter_notes=?, interview_date=?, interview_mode=?, interview_link=? WHERE id=?',
      [status, recruiter_notes, interview_date, interview_mode, interview_link, req.params.appId]
    );

    // Notify student
    const [apps] = await pool.query(
      'SELECT a.*, sp.user_id, pd.title as drive_title FROM applications a JOIN student_profiles sp ON a.student_id=sp.id JOIN placement_drives pd ON a.drive_id=pd.id WHERE a.id=?',
      [req.params.appId]
    );
    if (apps.length > 0) {
      const statusMessages = {
        shortlisted: 'You have been shortlisted',
        selected: '🎉 Congratulations! You have been selected',
        rejected: 'Unfortunately, your application was not selected',
        interview: 'An interview has been scheduled for you'
      };
      const msg = statusMessages[status] || `Application status updated to: ${status}`;
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
        [apps[0].user_id, 'Application Update', `${msg} for "${apps[0].drive_title}".`, status === 'selected' ? 'success' : 'info', req.params.appId, 'application']
      );
    }

    res.json({ success: true, message: 'Application status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Student: PUT /api/drives/applications/:appId/respond
const respondToOffer = async (req, res) => {
  const { action } = req.body; // 'accept' or 'decline'
  const newStatus = action === 'accept' ? 'offer_accepted' : 'offer_declined';
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (!sp.length) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const [app] = await pool.query('SELECT * FROM applications WHERE id = ? AND student_id = ?', [req.params.appId, sp[0].id]);
    if (!app.length) return res.status(404).json({ success: false, message: 'Application not found.' });

    if (app[0].status !== 'selected' && app[0].status !== 'offer_accepted' && app[0].status !== 'offer_declined') {
      return res.status(400).json({ success: false, message: 'Can only respond to selected job offers.' });
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [newStatus, req.params.appId]);

    if (action === 'accept') {
      await pool.query("UPDATE student_profiles SET placement_status = 'placed' WHERE id = ?", [sp[0].id]);
    }

    // Add notification
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, notification_type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        action === 'accept' ? '🎉 Placement Offer Accepted!' : 'Offer Declined',
        `You have ${action === 'accept' ? 'accepted' : 'declined'} the placement offer.`,
        'success',
        req.params.appId,
        'application'
      ]
    );

    res.json({
      success: true,
      message: `Offer ${action === 'accept' ? 'accepted! Congratulations on your placement!' : 'declined.'}`,
      status: newStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllDrives,
  getDriveById,
  applyToDrive,
  checkEligibility,
  getMyApplications,
  createDrive,
  updateDrive,
  getDriveApplications,
  updateApplicationStatus,
  respondToOffer
};

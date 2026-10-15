const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getProfile, updateProfile, addSkill, deleteSkill,
  addProject, deleteProject, addCertification, deleteCertification, getDashboard
} = require('../controllers/studentController');
const { uploadResume } = require('../config/cloudinary');
const { pool } = require('../config/db');

// All student routes require auth
router.use(authMiddleware, roleMiddleware('student'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/skills', addSkill);
router.delete('/skills/:id', deleteSkill);
router.post('/projects', addProject);
router.delete('/projects/:id', deleteProject);
router.post('/certifications', addCertification);
router.delete('/certifications/:id', deleteCertification);

// Resume upload
router.post('/resume/upload', uploadResume.single('resume'), async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (!sp.length) return res.status(404).json({ success: false, message: 'Profile not found.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const fileUrl = req.file.path || `data:application/pdf;base64,...`;
    const publicId = req.file.filename || null;

    // Set all others as non-primary first
    await pool.query('UPDATE resumes SET is_primary = 0 WHERE student_id = ?', [sp[0].id]);

    const [result] = await pool.query(
      'INSERT INTO resumes (student_id, file_name, file_url, cloudinary_public_id, file_size, is_primary) VALUES (?, ?, ?, ?, ?, 1)',
      [sp[0].id, req.file.originalname, fileUrl, publicId, req.file.size]
    );
    res.status(201).json({ success: true, message: 'Resume uploaded.', resume: { id: result.insertId, file_name: req.file.originalname, file_url: fileUrl } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed.' });
  }
});

// Delete resume
router.delete('/resume/:id', async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query('DELETE FROM resumes WHERE id = ? AND student_id = ?', [req.params.id, sp[0].id]);
    res.json({ success: true, message: 'Resume deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../middleware/auth');

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }
  if (!['student', 'admin', 'recruiter'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    const userId = result.insertId;

    // Create role-specific profile
    if (role === 'student') {
      const [sp] = await pool.query('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
        [userId, 'Welcome to PlacePro Cloud!', 'Your account has been created. Complete your profile to get started.', 'success']
      );
    } else if (role === 'admin') {
      await pool.query('INSERT INTO admin_profiles (user_id) VALUES (?)', [userId]);
    } else if (role === 'recruiter') {
      await pool.query('INSERT INTO recruiters (user_id) VALUES (?)', [userId]);
    }

    const token = generateToken({ id: userId, email, role, name });
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is disabled. Contact admin.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_picture: user.profile_picture }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_picture, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };

const { pool } = require('../config/db');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { unread_only, limit = 20 } = req.query;
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.user.id];
    if (unread_only === 'true') { query += ' AND is_read = 0'; }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notifications] = await pool.query(query, params);
    const [[{ unreadCount }]] = await pool.query('SELECT COUNT(*) as unreadCount FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };

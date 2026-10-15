const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');

router.use(authMiddleware);
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

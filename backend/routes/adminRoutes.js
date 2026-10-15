const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAdminDashboard, getAllStudents, updatePlacementStatus, getAllCompanies,
  createCompany, updateCompany, getPlacementReport, createQuestion, createMockTest, sendNotification
} = require('../controllers/adminController');

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/students', getAllStudents);
router.put('/students/:id/placement-status', updatePlacementStatus);
router.get('/companies', getAllCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.get('/reports/placement', getPlacementReport);
router.post('/questions', createQuestion);
router.post('/tests', createMockTest);
router.post('/notifications/broadcast', sendNotification);

module.exports = router;

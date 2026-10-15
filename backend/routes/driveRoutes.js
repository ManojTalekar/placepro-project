const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAllDrives, getDriveById, applyToDrive, checkEligibility,
  getMyApplications, createDrive, updateDrive, getDriveApplications, updateApplicationStatus,
  respondToOffer
} = require('../controllers/driveController');

// Public + student routes
router.get('/', authMiddleware, getAllDrives);
router.get('/my-applications', authMiddleware, roleMiddleware('student'), getMyApplications);
router.get('/:id', authMiddleware, getDriveById);
router.get('/:id/check-eligibility', authMiddleware, roleMiddleware('student'), checkEligibility);
router.post('/:id/apply', authMiddleware, roleMiddleware('student'), applyToDrive);
router.put('/applications/:appId/respond', authMiddleware, roleMiddleware('student'), respondToOffer);

// Admin + recruiter routes
router.post('/', authMiddleware, roleMiddleware('admin', 'recruiter'), createDrive);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'recruiter'), updateDrive);
router.get('/:id/applications', authMiddleware, roleMiddleware('admin', 'recruiter'), getDriveApplications);
router.put('/applications/:appId/status', authMiddleware, roleMiddleware('admin', 'recruiter'), updateApplicationStatus);

module.exports = router;

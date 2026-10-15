const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { analyzeResume, getAnalysisHistory, getSkillGap } = require('../controllers/resumeController');

router.use(authMiddleware);
router.post('/analyze', analyzeResume);
router.get('/history', getAnalysisHistory);
router.get('/skill-gap/:driveId', getSkillGap);

module.exports = router;

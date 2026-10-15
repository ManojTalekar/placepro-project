const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getCategories, getTests, getTestQuestions, submitTest, getTestHistory,
  getInterviewQuestions, saveInterviewQuestion, getSavedQuestions
} = require('../controllers/assessmentController');

router.use(authMiddleware);

// Assessment/Test routes
router.get('/categories', getCategories);
router.get('/tests', getTests);
router.get('/tests/:id/questions', getTestQuestions);
router.post('/tests/:id/submit', submitTest);
router.get('/history', getTestHistory);

// Interview prep routes
router.get('/interview/questions', getInterviewQuestions);
router.post('/interview/save/:questionId', saveInterviewQuestion);
router.get('/interview/saved', getSavedQuestions);

module.exports = router;

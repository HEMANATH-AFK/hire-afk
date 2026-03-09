const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateInterview, submitAnswer, getInterviews } = require('../controllers/interviewController');

router.post('/generate', protect, generateInterview);
router.post('/submit', protect, submitAnswer);
router.get('/my', protect, getInterviews);

module.exports = router;

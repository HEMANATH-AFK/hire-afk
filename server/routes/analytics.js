const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getRecruiterStats, getJobFunnel, getSkillGapAnalysis } = require('../controllers/analyticsController');

router.get('/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/job-funnel/:jobId', protect, authorize('recruiter'), getJobFunnel);
router.get('/skill-gap/:jobId', protect, authorize('recruiter'), getSkillGapAnalysis);

module.exports = router;

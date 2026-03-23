const express = require('express');
const router = express.Router();
const { getStudentApplications, getRecruiterApplications, getJobApplications, updateApplicationStatus, manualApply, deleteApplication, filterApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/student', protect, authorize('student'), getStudentApplications);
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterApplications);
router.get('/filter', protect, authorize('recruiter', 'admin'), filterApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.post('/manual', protect, authorize('student'), manualApply);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('student', 'recruiter', 'admin'), deleteApplication);

module.exports = router;

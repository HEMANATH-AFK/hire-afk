const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    resolveReport,
    adminActionRecruiter,
    getPlatformStats,
    getStudents,
    getRecruiters,
    deleteUser,
    getAllJobs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Student reports a recruiter
router.post('/report', protect, authorize('student'), createReport);

// Admin moderation
router.get('/reports', protect, authorize('admin'), getReports);
router.get('/stats', protect, authorize('admin'), getPlatformStats);
router.get('/students', protect, authorize('admin'), getStudents);
router.get('/recruiters', protect, authorize('admin'), getRecruiters);
router.get('/jobs', protect, authorize('admin'), getAllJobs);
router.put('/reports/:id/resolve', protect, authorize('admin'), resolveReport);
router.put('/recruiters/:id/action', protect, authorize('admin'), adminActionRecruiter);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);


module.exports = router;

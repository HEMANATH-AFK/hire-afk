const express = require('express');
const router = express.Router();
const { getGamificationStatus } = require('../controllers/gamificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/status', protect, authorize('student'), getGamificationStatus);

module.exports = router;

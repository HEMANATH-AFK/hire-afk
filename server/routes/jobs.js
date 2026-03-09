const express = require('express');
const router = express.Router();
const { createJob, getJobs, getRecruiterJobs, updateJob, deleteJob } = require('../controllers/jobController');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', getJobs);
router.get('/myjobs', protect, authorize('recruiter'), getRecruiterJobs);
router.post('/', protect, authorize('recruiter'), upload.single('companyLogo'), createJob);
router.put('/:id', protect, authorize('recruiter'), upload.single('companyLogo'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;

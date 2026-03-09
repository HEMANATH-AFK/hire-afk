const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', protect, getProfile);
router.put('/', protect, upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 }
]), updateProfile);

module.exports = router;

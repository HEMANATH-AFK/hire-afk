const express = require('express');
const router = express.Router();
const { getSkills } = require('../controllers/skillController');

// Open endpoint to fetch skills (autocomplete)
router.get('/', getSkills);

module.exports = router;

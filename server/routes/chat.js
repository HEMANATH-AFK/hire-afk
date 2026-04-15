const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getChatContacts } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/contacts', protect, getChatContacts);
router.get('/:chatId', protect, getMessages);
router.post('/send', protect, sendMessage);

module.exports = router;

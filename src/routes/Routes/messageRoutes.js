// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../../controller/messageController');
// const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/send',  sendMessage);
router.get('/messages',  getMessages);

module.exports = router;

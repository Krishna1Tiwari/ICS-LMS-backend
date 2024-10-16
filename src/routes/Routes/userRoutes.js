// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile,  } = require('../../controller/userController');
// const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/profile',  getUserProfile);
router.put('/profile', updateUserProfile);

module.exports = router;

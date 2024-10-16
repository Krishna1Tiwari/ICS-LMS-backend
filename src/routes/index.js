// routes/index.js
const express = require('express');
const authRoutes = require('./Routes/authRoutes');
const getAllUsers = require('./Routes/adminRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const userRoutes = require('./Routes/userRoutes')

const router = express.Router();

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/admin',getAllUsers)


module.exports = router;

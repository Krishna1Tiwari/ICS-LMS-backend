// routes/index.js
const express = require('express');
const authRoutes = require('./Routes/authRoutes');
// const getAllUsers = require('./Routes/adminRoutes');
// const messageRoutes = require('./Routes/messageRoutes');
const userRoutes = require('./Routes/userRoutes');
const CoursesRoutes = require('./Routes/CoursesRoutes');
const EnrollmentRoutes = require('./Routes/EnrollmentRoutes')

const router = express.Router();

router.use('/auth', authRoutes)
router.use('/user', userRoutes);
router.use('/enrollment',EnrollmentRoutes)
router.use('/courses',CoursesRoutes);



module.exports = router;

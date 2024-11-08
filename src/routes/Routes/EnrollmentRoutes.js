const express = require('express');
const router = express.Router();
const { enrollInCourse } = require('../../controller/enrollmentCoursesController');
// const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/free/enroll',enrollInCourse)
module.exports = router;
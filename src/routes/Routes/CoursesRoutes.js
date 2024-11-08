const express = require('express');
const router = express.Router();
const { getAllCourses,getUserCourses,getCourseById } = require('../../controller/CoursesController');
// const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/get/courses',  getAllCourses);
router.get('/get/user/courses',  getUserCourses);
router.get('/get/courses/id',  getCourseById);




module.exports = router;
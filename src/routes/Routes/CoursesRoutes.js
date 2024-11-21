const express = require('express');
const router = express.Router();
const { getAllCourses, getUserCourses, getCourseById, uploadCourseContent, getVideoStream,deleteCourse,getThumbnail } = require('../../controller/CoursesController');

// const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/get/courses', getAllCourses);
router.get('/get/user/courses', getUserCourses);
router.get('/get/courses/id', getCourseById);
// Route to upload course content
// Expecting files like: { thumbnail: file, video1: file, video2: file, ... }
router.post(
    '/upload-course',
    uploadCourseContent
);
router.delete('/delete/:courseId', deleteCourse);

// Route to stream video by ID
router.get('/video', getVideoStream);
router.get('/thumbnail', getThumbnail);




module.exports = router;
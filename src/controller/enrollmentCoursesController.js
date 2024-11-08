const User = require('../models/User');
const Course = require('../models/Courses')


// Enroll user in a course
  exports.enrollInCourse = async (req, res) => {
    const { userId, courseId } = req.body; // Assuming userId and courseId are sent in the request body
  
    try {
      // Find the course by ID
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is already enrolled in the course
      const isAlreadyEnrolled = user.enrolledCourses.some(
        (enrollment) => enrollment.courseId.toString() === courseId
      );
  
      if (isAlreadyEnrolled) {
        return res.status(400).json({ message: 'User is already enrolled in this course' });
      }
  
      // Add course to user's enrolledCourses array
      const enrollment = {
        courseId: course._id,
        enrollmentDate: Date.now(),
        progress: 0,  // Default progress to 0
        completedVideos: [], // No videos completed initially
        isCompleted: false,
      };
  
      user.enrolledCourses.push(enrollment);
  
      // Save the updated user data
      await user.save();
  
      res.status(200).json({ message: 'User successfully enrolled in the course', data: user });
    } catch (error) {
      console.error('Error enrolling user in course:', error);
      res.status(500).json({ message: 'Server error. Could not enroll user in the course.' });
    }
  };
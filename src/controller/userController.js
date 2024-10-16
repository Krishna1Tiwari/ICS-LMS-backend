const User = require('../models/User');
const Course = require('../models/Courses')
// Get user profile along with activity records (enrolled courses and progress)
exports.getUserProfile = async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findById(userId).select('-password'); // Exclude sensitive information
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Populate the enrolledCourses with course details
        await user.populate({
            path: 'enrolledCourses.courseId',
            model: 'Course',  // Populate course data
            select: 'title description thumbnail modules',  // Specify what fields to return
        });

        res.status(200).json({ data: { user } });
    } catch (error) {
        console.error('Error fetching user profile:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile (General user information update)
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Enroll in a course
exports.enrollInCourse = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is already enrolled in the course
        const isAlreadyEnrolled = user.enrolledCourses.some((enrolledCourse) => 
            enrolledCourse.courseId.toString() === courseId
        );
        if (isAlreadyEnrolled) {
            return res.status(400).json({ message: 'User is already enrolled in this course' });
        }

        // Add course to enrolledCourses
        user.enrolledCourses.push({
            courseId: course._id,
            enrollmentDate: new Date(),
            progress: 0,
            completedVideos: [],
            isCompleted: false,
        });

        await user.save();
        res.status(200).json({ message: 'Successfully enrolled in the course', data: user.enrolledCourses });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update course progress
exports.updateCourseProgress = async (req, res) => {
    const { courseId, videoId, progress } = req.body; // Input: courseId, videoId, and new progress
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId);
        const enrolledCourse = user.enrolledCourses.find((course) => course.courseId.toString() === courseId);

        if (!enrolledCourse) {
            return res.status(404).json({ message: 'Course not found in user enrollments' });
        }

        // Check if video is already marked as completed
        const isVideoCompleted = enrolledCourse.completedVideos.some((video) => video.videoId === videoId);
        if (!isVideoCompleted) {
            enrolledCourse.completedVideos.push({ videoId });
        }

        // Update progress percentage
        enrolledCourse.progress = progress;

        // Mark course as completed if progress reaches 100%
        if (progress === 100) {
            enrolledCourse.isCompleted = true;
        }

        await user.save();
        res.status(200).json({ message: 'Course progress updated', data: enrolledCourse });
    } catch (error) {
        console.error('Error updating course progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

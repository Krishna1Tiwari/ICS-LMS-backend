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

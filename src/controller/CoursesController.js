const User = require('../models/User');
const Course = require('../models/Courses')

// Fetch all courses
exports.getAllCourses = async (req, res) => {
    try {
      const courses = await Course.find(); // Fetch all courses from the database
      res.status(200).json({data:{courses}}); // Return the courses as a JSON response
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Server error. Could not fetch courses.' });
    }
  };
  exports.getCourseById = async (req, res) => {
    const { courseId } = req.query; // Extract the course ID from the URL parameter
    try {
      // Fetch the course from the database by its ID
      const course = await Course.findById(courseId);
  
      // If no course is found with the provided ID
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Return the course data as a JSON response
      res.status(200).json({ data: [ course ] });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Server error. Could not fetch the course.' });
    }
  };
  

//   exports.getUserCourses = async (req, res) => {
//     const { userId } = req.query;
//     try {
//         const user = await User.findById(userId).select('-password'); // Exclude sensitive information
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Populate the enrolledCourses with course details
//         await user.populate({
//             path: 'enrolledCourses.courseId',
//             model: 'Course',  // Populate course data
//             select: 'title description thumbnail modules',  // Specify what fields to return
//         });

//         res.status(200).json({ data: { user } });
//     } catch (error) {
//         console.error('Error fetching user profile:', error); // Log error for debugging
//         res.status(500).json({ message: 'Server error' });
//     }
// };

exports.getUserCourses = async (req, res) => {
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
            select: 'title description thumbnail modules pricing' // Specify what fields to return from Course model
        });

        // Extract only the enrolled courses
        const enrolledCourses = user.enrolledCourses.map(enrollment => ({
            courseId: enrollment.courseId._id,
            title: enrollment.courseId.title,
            description: enrollment.courseId.description,
            thumbnail: enrollment.courseId.thumbnail,
            modules: enrollment.courseId.modules,
            pricing: enrollment.courseId.pricing,
            enrollmentDate: enrollment.enrollmentDate,
            progress: enrollment.progress,
            isCompleted: enrollment.isCompleted
        }));

        res.status(200).json({data:{ enrolledCourses }});
    } catch (error) {
        console.error('Error fetching user courses:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};

const User = require('../models/User');
const Course = require('../models/Courses')
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const dotenv = require('dotenv');
const { upload } = require('../middleware/multerMiddleware'); // Import the upload middleware
// const { GridFSBucket } = require('mongodb');
const { GridFSBucket } = require('mongodb');

const conn = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let gfsBucket;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads' // or whatever you name your bucket
  });
});

// const bucket = new GridFSBucket(mongoose.connection.db, {
//   bucketName: 'uploads', // Name of your GridFS bucket
// });
// Fetch all courses
exports.getAllCourses = async (req, res) => {
  try {
    // Fetch all courses from the database
    const courses = await Course.find();

    // Construct the base URL dynamically from the request
    const baseUrl = `${req.protocol}://${req.get('host')}/api/courses`;

    // Map over the courses to add thumbnail and video URLs
    const coursesWithUrls = courses.map(course => ({
      _id: course._id,
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: `${baseUrl}/thumbnail?thumbnailId=${course.thumbnailId}`,
      category: course.category,
      type: course.type,
      price: course.price,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        videos: module.videos.map(video => ({
          id: video.id,
          title: video.title,
          videoUrl: `${baseUrl}/video?videoId=${video.videoId}`,
          objective: video.objective,
          breakpoints: video.breakpoints.map(breakpoint => ({
            time: breakpoint.time,
            quiz: breakpoint.quiz
          }))
        }))
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));

    // Return the courses with thumbnail and video URLs
    res.status(200).json({data:{ courses: coursesWithUrls }});
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error. Could not fetch courses.' });
  }
};


exports.getCourseById = async (req, res) => {
  const { courseId } = req.query; // Extract the course ID from the URL query
  try {
    // Fetch the course from the database by its ID
    const course = await Course.findById(courseId);

    // If no course is found with the provided ID
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Construct the base URL dynamically from the request
    const baseUrl = `${req.protocol}://${req.get('host')}/api/courses`;

    // Add thumbnail and video URLs to the course object
    const courseWithUrls = {
      _id: course._id,
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: `${baseUrl}/thumbnail?thumbnailId=${course.thumbnailId}`,
      category: course.category,
      type: course.type,
      price: course.price,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        videos: module.videos.map(video => ({
          id: video.id,
          title: video.title,
          videoUrl: `${baseUrl}/video?videoId=${video.videoId}`,
          objective: video.objective,
          breakpoints: video.breakpoints.map(breakpoint => ({
            time: breakpoint.time,
            quiz: breakpoint.quiz
          }))
        }))
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };

    // Return the course data with URLs
    res.status(200).json({ data: [courseWithUrls] });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error. Could not fetch the course.' });
  }
};

// Upload course content, including videos and thumbnails
// exports.uploadCourseContent = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error('Error with file upload:', err);
//       return res.status(500).json({ message: 'File upload failed', error: err.message });
//     }
// console.log(req.body)
//     try {
//       const { id, title, description, category, type, price } = req.body;

//       // Parse the modules since they are being sent as JSON strings
//       const modules = req.body.modules.map((module) => JSON.parse(module));

//       if (!Array.isArray(modules)) {
//         return res.status(400).json({ message: 'Modules should be an array.' });
//       }

//       if (!id || !title || !description || !category || !type) {
//         return res.status(400).json({ message: 'Please provide all required fields.' });
//       }

//       if (!req.files) {
//         return res.status(400).json({ message: 'Video files are required.' });
//       }
// console.log(req.files)
//       // Process the modules and videos
//       const processedModules = modules.map((module, moduleIndex) => {
//         if (!Array.isArray(module.videos)) {
//           throw new Error(`Invalid format for videos in module: ${module.title}`);
//         }

//         const processedVideos = module.videos.map((video, videoIndex) => {
//           // Map video files based on index
//           const videoFile = req.files[`videos[${moduleIndex}][${videoIndex}]`];
//           const videoId = videoFile ? videoFile?.id : null;

//           console.log(videoFile)
//           console.log(videoId)
//           if (!videoId) {
//             throw new Error(`Video file is missing for video: ${video.title}`);
//           }

//           return {
//             id: video.id,  // Expecting id from frontend
//             title: video.title,
//             videoId,
//             objective: video.objective,
//             breakpoints: video.breakpoints,
//           };
//         });

//         return {
//           id: module.id,  // Expecting id from frontend
//           title: module.title,
//           description: module.description,
//           videos: processedVideos,
//         };
//       });

//       const newCourse = new Course({
//         id,
//         title,
//         description,
//         category,
//         type,
//         price: type === 'premium' ? price : null,
//         modules: processedModules,
//       });

//       await newCourse.save();
//       return res.status(201).json({ message: 'Course uploaded successfully', newCourse });

//     } catch (error) {
//       console.error('Error uploading course content:', error.message || error);
//       return res.status(500).json({ message: error.message || 'Error uploading course content', error });
//     }
//   });
// };

exports.uploadCourseContent = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error with file upload:', err);
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    }

    try {
      const { id, title, description, category, type, price } = req.body;

      // Parse the modules from JSON strings
      const modules = req.body.modules.map((module) => JSON.parse(module));

      if (!Array.isArray(modules)) {
        return res.status(400).json({ message: 'Modules should be an array.' });
      }

      if (!id || !title || !description || !category || !type) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Video files are required.' });
      }

      // Process the thumbnail file (if it exists)
      let thumbnailId = null;
      const thumbnailFile = req.files.find(file => file.fieldname === 'thumbnail');
      if (thumbnailFile) {
        thumbnailId = thumbnailFile.id;  // GridFS ID of the thumbnail file
      }

      // Create a function to find the corresponding video file from req.files array
      const findVideoFile = (moduleIndex, videoIndex) => {
        const fieldName = `videos[${moduleIndex}][${videoIndex}]`;
        return req.files.find(file => file.fieldname === fieldName);
      };

      // Process the modules and videos
      const processedModules = modules.map((module, moduleIndex) => {
        if (!Array.isArray(module.videos)) {
          throw new Error(`Invalid format for videos in module: ${module.title}`);
        }

        const processedVideos = module.videos.map((video, videoIndex) => {
          const videoFile = findVideoFile(moduleIndex, videoIndex);
          if (!videoFile) {
            throw new Error(`Video file is missing for video: ${video.title}`);
          }

          return {
            id: video.id,  // Video ID from frontend
            title: video.title,
            videoId: videoFile.id,  // GridFS file ID
            objective: video.objective,
            breakpoints: video.breakpoints,
          };
        });

        return {
          id: module.id,  // Module ID from frontend
          title: module.title,
          description: module.description,
          videos: processedVideos,
        };
      });

      const newCourse = new Course({
        id,
        title,
        description,
        category,
        type,
        price: type === 'premium' ? price : null,
        thumbnailId,
        modules: processedModules,
      });

      await newCourse.save();
      return res.status(201).json({ message: 'Course uploaded successfully', newCourse });

    } catch (error) {
      console.error('Error uploading course content:', error.message || error);
      return res.status(500).json({ message: error.message || 'Error uploading course content', error });

    }
  });
};

// Stream a video from GridFS
exports.getVideoStream = async (req, res) => {
  try {
    const { videoId } = req.query;

    // Find the video file in GridFS
    const video = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(videoId) }).toArray();
    if (!video || video.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const file = video[0];
    const fileSize = file.length;  // Get the file size from GridFS

    // Get the 'Range' header from the request
    const range = req.headers.range;

    if (!range) {
      // If no Range header, send the entire video
      res.set('Content-Type', file.contentType);
      res.set('Content-Length', fileSize);
      
      // Stream the entire video from GridFS
      const downloadStream = gfsBucket.openDownloadStream(file._id);
      return downloadStream.pipe(res);
    }

    // Parse the Range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);  // Get the start byte
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;  // Get the end byte or use the full file size

    // Calculate chunk size
    const chunkSize = (end - start) + 1;

    // Set the headers for the partial content response (206)
    res.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': file.contentType
    });

    // Stream the requested part of the video
    const downloadStream = gfsBucket.openDownloadStream(file._id, {
      start,
      end: end + 1 // GridFS is non-inclusive on the 'end' parameter
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error streaming video:', error);
    return res.status(500).json({ message: 'Error streaming video', error });
  }
};

// Stream a thumbnail from GridFS
exports.getThumbnail = async (req, res) => {
  try {
    const { thumbnailId } = req.query;

    // Check if thumbnailId is provided
    if (!thumbnailId) {
      return res.status(400).json({ message: 'Thumbnail ID is required' });
    }

    // Check if the thumbnailId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(thumbnailId)) {
      return res.status(400).json({ message: 'Invalid thumbnail ID format' });
    }

    // Convert thumbnailId to ObjectId
    const objectId = new mongoose.Types.ObjectId(thumbnailId);

    // Find the thumbnail in GridFS
    const video = await gfsBucket.find({ _id: objectId }).toArray();

    if (!video || video.length === 0) {
      return res.status(404).json({ message: 'Thumbnail not found' });
    }

    // Set the response headers for the image type
    res.set('Content-Type', video[0].contentType);

    // Stream the thumbnail from GridFS
    const downloadStream = gfsBucket.openDownloadStream(video[0]._id);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    res.status(500).json({ message: 'Error fetching thumbnail', error });
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
      select: 'title description thumbnailId modules pricing' // Specify what fields to return from Course model
    });

    // Construct the base URL dynamically from the request
    const baseUrl = `${req.protocol}://${req.get('host')}/api/courses`;

    // Extract only the enrolled courses and add the thumbnail URL
    const enrolledCourses = user.enrolledCourses.map(enrollment => ({
      courseId: enrollment.courseId._id,
      title: enrollment.courseId.title,
      description: enrollment.courseId.description,
      thumbnailUrl: `${baseUrl}/thumbnail?thumbnailId=${enrollment.courseId.thumbnailId}`, // Thumbnail URL
      modules: enrollment.courseId.modules,
      pricing: enrollment.courseId.pricing,
      enrollmentDate: enrollment.enrollmentDate,
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted
    }));

    res.status(200).json({ data: { enrolledCourses } });
  } catch (error) {
    console.error('Error fetching user courses:', error); // Log error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete a course by ID
exports.deleteCourse = async (req, res) => {
  const { courseId } = req.params; // Get courseId from request params

  try {
    // Find the course by ID
    const course = await Course.findById(courseId);

    // If no course is found
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Function to delete files from GridFS
    const deleteFileFromGridFS = async (fileId) => {
      try {
        await gfsBucket.delete(new mongoose.Types.ObjectId(fileId));
      } catch (err) {
        console.error('Error deleting file from GridFS:', err);
      }
    };

    // Delete videos associated with the course
    if (course.modules && course.modules.length > 0) {
      for (const module of course.modules) {
        for (const video of module.videos) {
          await deleteFileFromGridFS(video.videoId); // Remove each video file
        }
      }
    }

    // Delete the course thumbnail if it exists
    if (course.thumbnailId) {
      await deleteFileFromGridFS(course.thumbnailId); // Remove thumbnail
    }

    // Delete the course from the database
    await Course.findByIdAndDelete(courseId);

    // Cleanup enrolled courses for all users who are enrolled in this course
    await User.updateMany(
      { 'enrolledCourses.courseId': courseId }, // Find users enrolled in this course
      { $pull: { enrolledCourses: { courseId: courseId } } } // Remove the course progress from their enrolledCourses array
    );

    res.status(200).json({ message: 'Course and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error. Could not delete course.' });
  }
};

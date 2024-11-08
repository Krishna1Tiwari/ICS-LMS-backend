// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Grid = require('gridfs-stream');

// dotenv.config();

// // Connection for Auth/User Data Cluster
// const connectAuthDB = async () => {
//     try {
//         const authConn = await mongoose.createConnection(process.env.MONGO_URI_AUTH, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         console.log('Auth and User Data MongoDB connected successfully.');
//         return authConn; // Return the connection
//     } catch (error) {
//         console.error('Auth MongoDB connection failed:', error.message);
//         process.exit(1);
//     }
// };

// // Connection for Courses Data Cluster and GridFS
// let gfs;
// const connectCoursesDB = async () => {
//     try {
//         const coursesConn = await mongoose.createConnection(process.env.MONGO_URI_COURSES, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         // Initialize GridFS stream
//         gfs = Grid(coursesConn.db, mongoose.mongo);
//         gfs.collection('uploads'); // Name of the GridFS collection for storing files
//         console.log('Courses MongoDB and GridFS connected successfully.');
//         return coursesConn; // Return the connection
//     } catch (error) {
//         console.error('Courses MongoDB connection failed:', error.message);
//         process.exit(1);
//     }
// };

// module.exports = {
//     connectAuthDB,
//     connectCoursesDB,
//     gfs,  // Export gfs for use in file uploads
// };

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the quiz schema
const QuizSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: String, required: true },
});

// Define the breakpoints schema
const BreakpointSchema = new Schema({
  time: { type: Number, required: true },
  quiz: QuizSchema, // Embed the quiz schema
});

// Define the video schema
const VideoSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  objective: { type: String, required: true },
  breakpoints: [BreakpointSchema], // Array of breakpoints
});

// Define the module schema
const ModuleSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  videos: [VideoSchema], // Array of videos
});

// Define the course schema
const CourseSchema = new Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true, enum: ['free', 'premium'], default: 'free' }, // Type: free or premium
  modules: [ModuleSchema], // Array of modules
}, { timestamps: true });


const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;


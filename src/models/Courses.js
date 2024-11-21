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
  time: { type: Number, required: true }, // Time in the video where the quiz appears
  quiz: QuizSchema, // Embed the quiz schema
});

// Define the video schema
const VideoSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files', required: true }, // Refers to the GridFS file ID
  objective: { type: String, required: true }, // Objective of the video
  breakpoints: [BreakpointSchema], // Array of breakpoints for quizzes
});

// Define the module schema
const ModuleSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  videos: [VideoSchema], // Array of videos in the module
});

// Define the course schema
const CourseSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnailId: {type:String},  // Store GridFS ID for the thumbnail
  category: { type: String, required: true }, // Category (e.g., Web Development, Cybersecurity)
  type: { 
    type: String, 
    required: true, 
    enum: ['free', 'premium'], // Type of course: either free or premium
    default: 'free' 
  },
  price: { 
    type: Number, 
    required: function() { return this.type === 'premium'; } // Price is required only for premium courses
  },
  modules: [ModuleSchema], // Array of modules
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;

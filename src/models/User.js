const mongoose = require('mongoose');

// Subschema to track user's progress for each course
const courseProgressSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Assuming you have a Course model
        required: true,
    },
    enrollmentDate: {
        type: Date,
        default: Date.now, // Date when the user enrolled in the course
    },
    progress: {
        type: Number,
        default: 0, // Progress percentage (0 to 100)
    },
    completedVideos: [{
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video', // Assuming you have a Video model
        },
        completionDate: {
            type: Date,
            default: Date.now, // Date when the video was completed
        },
    }],
    isCompleted: {
        type: Boolean,
        default: false, // True if the course is completed
    },
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    enrolledCourses: [courseProgressSchema],  // Array to track user's course enrollments and progress
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// You can add methods here to calculate course completion percentage, etc.

const User = mongoose.model('User', userSchema);
module.exports = User;

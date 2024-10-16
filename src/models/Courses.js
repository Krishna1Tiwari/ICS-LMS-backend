const mongoose = require('mongoose');

// Video Schema
const videoSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { _id: false }); // Disable auto _id generation for sub-documents

// Module Schema
const moduleSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    videos: [videoSchema],  // Array of video sub-documents
}, { _id: false }); // Disable auto _id generation for sub-documents

// Course Schema
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['free', 'premium'],  // Course can be either free or premium
        default: 'free',
        required: true,
    },
    price: {
        type: Number,
        required: function() { return this.category === 'premium'; },  // Price is required if the course is premium
        min: 0,
    },
    modules: [moduleSchema],  // Array of module sub-documents
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;

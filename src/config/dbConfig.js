const mongoose = require('mongoose');
// const { GridFSBucket } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected:${process.env.MONGO_URI}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// let gridfsBucket;

// // Initialize GridFS when MongoDB connection is open
// mongoose.connection.once('open', () => {
//     gridfsBucket = new GridFSBucket(mongoose.connection.db, {
//         bucketName: 'uploads', // The name of the GridFS collection where files will be stored
//     });
//     console.log('GridFS Bucket initialized');
// });

// // Function to get gridfsBucket after connection has opened
// const getGridFsBucket = () => {
//     if (!gridfsBucket) {
//         throw new Error('GridFSBucket is not initialized. Please wait until the database is connected.');
//     }
//     return gridfsBucket;
// };

// Export the connectDB function and gridfsBucket getter for file operations
module.exports = { connectDB };

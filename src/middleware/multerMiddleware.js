const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();


// Set up GridFS storage with multer-gridfs-storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }

        // Generate unique filename using random bytes
        const filename = buf.toString('hex') + path.extname(file.originalname);

        const fileInfo = {
          filename: filename,
          bucketName: 'uploads', // Ensure the bucket name matches with your GridFS configuration
        };

        resolve(fileInfo); // Return file info
      });
    });
  },
});

// Event listeners for GridFS connection status
storage.on('connection', (db) => {
  console.log('GridFS storage connection established');
});

storage.on('error', (err) => {
  console.error('GridFS storage error:', err);
});

// Set up multer to handle file uploads
const upload = multer({ storage }).any();  // '.any()' allows multiple files to be handled

// Export the upload middleware for use in your routes
module.exports = { upload };

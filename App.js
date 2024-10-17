const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/dbConfig');
const routes = require('./src/routes/index');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');

const app = express();
// CORS setup to allow all origins
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['https://api.icsecurity.in', 'https://www.api.icsecurity.in']; // Add specific allowed URLs here

    // Allow requests with no origin (e.g., mobile apps, curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin matches one of the allowed URLs
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);  // Allow the request
    } else {
      callback(new Error('Not allowed by CORS'));  // Deny if the origin is not allowed
    }
  },
  credentials: true  // Allow credentials like cookies to be sent
}));

app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
connectDB();

// Routes
app.use('/api', routes);

// Centralized error handling (optional)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

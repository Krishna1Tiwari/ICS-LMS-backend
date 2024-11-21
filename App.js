const express = require('express');
const cors = require('cors');
const { connectDB, gridfsBucket } = require('./src/config/dbConfig');
const routes = require('./src/routes/index');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

const app = express();

// CORS setup to allow all origins
const allowedOrigins = [
  'https://icsecurity.in',
  'http://portal.icsecurity.in',
  'https://portal.icsecurity.in',
  'https://api.icsecurity.in',
  'https://www.api.icsecurity.in',
  'https://www.icsecurity.in',
  'http://localhost:3002',
  'http://localhost:3001'
];

app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, // Allow credentials if needed
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

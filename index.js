const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Enable CORS for frontend integration
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
app.use('/api/urls', require('./routes/urlRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Define a simple landing page
app.get('/', (req, res) => {
  res.send('URL Shortener API is running...');
});

// Set up server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

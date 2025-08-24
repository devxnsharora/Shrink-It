// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { handleRedirect } = require('./controllers/link.controller');

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully.'))
  .catch(err => console.error('MongoDB connection Error:', err));

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Your local frontend for development
    'https://shrink-it-tau.vercel.app' // LIVE VERCEL URL
    
  ]
};

// Middleware
app.use(cors(corsOptions)); // Use the configured options
app.use(express.json());


// --- ROUTES ---
app.use('/api/users', require('./routes/user.routes.js'));
app.use('/api/links', require('./routes/link.routes.js'));

app.get('/:shortCode', handleRedirect);

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Server is running on port ${PORT}`);
});
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

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/users', require('./routes/user.routes.js'));
app.use('/api/links', require('./routes/link.routes.js')); // <-- THE FIX IS HERE

app.get('/:shortCode', handleRedirect);


// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Server is running on port ${PORT}`);
});
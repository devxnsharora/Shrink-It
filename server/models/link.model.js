const mongoose = require('mongoose');

// --- Define the schema for an individual click ---
const ClickSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }, // Browser, OS, device info
    referrer: { type: String },
    geo: { // Geolocation data
        country: { type: String },
        city: { type: String },
    },
});

const LinkSchema = new mongoose.Schema({
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates a reference to our User model
    required: true,
    },
   originalUrl: { type: String, required: true },
   shortCode:   { type: String, required: true, unique: true },
   title:       { type: String, default: 'Untitled Link' },
   password:    { type: String, default: null },
   expiresAt:   { type: Date, default: null },
   isActive:    { type: Boolean, default: true },
   clicks:      { type: Number, required: true, default: 0 },
    clickDetails: [ClickSchema], // An array of click data objects

}, { timestamps: true });

module.exports = mongoose.model('Link',LinkSchema);
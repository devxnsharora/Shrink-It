// server/routes/link.routes.js

const express = require('express');
const router = express.Router();

// Import the auth middleware
const auth = require('../middleware/auth.middleware');

// Import the entire controller object
const linkController = require('../controllers/link.controller');

// --- Define Routes ---

// @route   POST /api/links
// @desc    Create a short link
router.post('/', auth, linkController.createShortLink);

// @route   GET /api/links
// @desc    Get all links for the logged-in user
router.get('/', auth, linkController.getUserLinks);

// @route   PUT /api/links/:id
// @desc    Update a specific link
router.put('/:id', auth, linkController.updateLink);

// @route   DELETE /api/links/:id
// @desc    Delete a specific link
router.delete('/:id', auth, linkController.deleteLink);

// @route   GET /api/links/:id/qr
// @desc    Get a QR code for a specific link
router.get('/:id/qr', auth, linkController.getLinkQRCode);

// @route   GET /api/links/:id/analytics
// @desc    Get analytics for a specific link
router.get('/:id/analytics', auth, linkController.getLinkAnalytics);

// @route   POST /api/links/analyze
// @desc    Analyze a URL to get an AI-generated title (Protected)
router.post('/analyze', auth, linkController.analyzeUrl);

// --- Export the router ---
module.exports = router;
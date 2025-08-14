// server/controllers/link.controller.js
const { nanoid } = require('nanoid');
const Link = require('../models/link.model');
const QRCode = require('qrcode');
const axios = require('axios');
const { generateTitleFromUrl } = require('../services/ai.service');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

const createShortLink = async (req, res) => {
  // Destructure `customSlug` from the request body
  const { originalUrl, title, customSlug } = req.body;
  const userId = req.user.id;

  if (!originalUrl) {
    return res.status(400).json({ message: 'Original URL is required.' });
  }

  try {
    let shortCode;

    if (customSlug) {
      // If a custom slug is provided, we need to check if it's already taken
      const existingLink = await Link.findOne({ shortCode: customSlug });
      if (existingLink) {
        // If the slug is taken, return an error
        return res.status(400).json({ message: 'This custom name is already taken. Please choose another.' });
      }
      // If it's available, use the custom slug as the short code
      shortCode = customSlug;
    } else {
      // If no custom slug, generate a random one
      shortCode = nanoid(7);
    }

    const newLink = new Link({
      originalUrl,
      shortCode, // This will be either the custom slug or the random nanoid
      title: title || originalUrl,
      user: userId,
    });

    await newLink.save();
    res.status(201).json({ ...newLink.toObject(), shortUrl: `${BASE_URL}/${newLink.shortCode}` });
  } catch (err) {
    // Add a check for potential database index errors, though our check should prevent it
    if (err.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: 'This custom name is already in use.' });
    }
    console.error('Error creating short link:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- GET all links for the logged-in user ---
const getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id }).sort({ createdAt: -1 });
    const linksWithShortUrl = links.map(link => ({
      ...link.toObject(),
      shortUrl: `${BASE_URL}/${link.shortCode}`
    }));
    res.json(linksWithShortUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- UPDATE a specific link ---
const updateLink = async (req, res) => {
  const { originalUrl, title, isActive, password, expiresAt } = req.body;
  try {
    let link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    if (link.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    // Update fields if they are provided in the request body
    if (originalUrl) link.originalUrl = originalUrl;
    if (title) link.title = title;
    if (typeof isActive === 'boolean') link.isActive = isActive;
    if (password !== undefined) link.password = password; // Allows setting an empty password
    if (expiresAt) link.expiresAt = expiresAt;

    await link.save();
    res.json({ ...link.toObject(), shortUrl: `${BASE_URL}/${link.shortCode}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- DELETE a specific link ---
const deleteLink = async (req, res) => {
  try {
    let link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    if (link.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await Link.deleteOne({ _id: req.params.id }); 
    res.json({ message: 'Link removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- GENERATE a QR Code for a short link (Protected) ---
const getLinkQRCode = async (req, res) => {
    try {
      const link = await Link.findById(req.params.id);
      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }
      if (link.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
      }
      const shortUrl = `${BASE_URL}/${link.shortCode}`;
      const qrCodeDataURL = await QRCode.toDataURL(shortUrl, {
          errorCorrectionLevel: 'H', margin: 2, color: { dark:"#0D1117", light:"#FFFFFF" }
      });
      res.json({ qrCodeUrl: qrCodeDataURL });
    } catch (err) {
      console.error("QR Code generation error:", err);
      res.status(500).json({ message: 'Server error' });
    }
};

// --- GET analytics data for a specific link (Protected) ---
const getLinkAnalytics = async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }
        if (link.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        res.json({
            totalClicks: link.clicks,
            clickDetails: link.clickDetails,
            title: link.title,
            originalUrl: link.originalUrl,
            shortUrl: `${BASE_URL}/${link.shortCode}`
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- The public REDIRECT handler with Analytics ---
const handleRedirect = async (req, res) => {
    try {
        const link = await Link.findOne({ shortCode: req.params.shortCode });
        if (!link) return res.status(404).send('<h1>Link not found</h1>');

        // Your existing checks
        if (!link.isActive) return res.status(403).send('<h1>Link has been disabled.</h1>');
        if (link.expiresAt && new Date() > link.expiresAt) return res.status(410).send('<h1>This link has expired.</h1>');
        if (link.password) return res.status(401).send('<h1>Password required</h1>');
        
        // Asynchronous click tracking (doesn't slow down the user)
        (async () => {
// Inside the (async () => { ... }) block in handleRedirect
try {
    let ipAddress = req.ip || req.connection.remoteAddress;
    
    // --- DEVELOPMENT HACK: SIMULATE A REAL IP ---
    // Check if the IP is a localhost address (IPv4 or IPv6)
    const isLocalhost = ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.includes('::ffff:');

    if (isLocalhost && process.env.NODE_ENV !== 'production') {
        // For testing, use a public IP address (e.g., Google's DNS)
        ipAddress = '182.79.255.254'; 
        console.log(`[DEV MODE] Simulating IP for analytics: ${ipAddress}`);
    }
    // --- END OF HACK ---

    let geo = { country: 'Unknown', city: 'Unknown' };

    // Use a free Geo IP API
    try {
        // The .split(':').pop() is a safety measure for some IPv6 formats
        const geoResponse = await axios.get(`http://ip-api.com/json/${ipAddress.split(':').pop()}`);
        if (geoResponse.data.status === 'success') {
            geo = {
                country: geoResponse.data.country,
                city: geoResponse.data.city,
            };
        }
    } catch (geoError) {
        console.warn(`Could not fetch geo data for IP ${ipAddress}`);
    }
    // ... rest of the logic (link.clicks++, link.clickDetails.push(...))
                
                link.clicks++;
                link.clickDetails.push({
                    ipAddress,
                    userAgent: req.headers['user-agent'],
                    referrer: req.headers['referer'] || 'Direct',
                    geo,
                });
                await link.save();
            } catch (trackingError) { console.error('Error saving click details:', trackingError); }
        })();

        return res.redirect(link.originalUrl);
    } catch (err) {
        console.error('Error handling redirect:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const analyzeUrl = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required.' });
  }
  try {
    const title = await generateTitleFromUrl(url);
    res.json({ title });
  } catch (err) {
    res.status(500).json({ message: 'Failed to analyze URL.' });
  }
};

// --- EXPORTS ---
// Ensure all functions are exported so the router can use them.
module.exports = {
  createShortLink,
  getUserLinks,
  updateLink,
  deleteLink,
  getLinkQRCode,
  getLinkAnalytics,
  handleRedirect,
  analyzeUrl,
};
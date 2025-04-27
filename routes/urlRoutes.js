const express = require('express');
const router = express.Router();
const { createShortUrl, getAllUrls, redirectToUrl, deleteUrl } = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

// Routes that can be accessed with or without authentication
// But will behave differently when authenticated
router.post('/shorten', createShortUrl);
router.get('/', getAllUrls);
router.get('/:shortId', redirectToUrl);

// Routes that can be accessed with or without authentication
// But with ownership check for authenticated users
router.delete('/:id', deleteUrl);

// Protected routes (require authentication)
// Apply protect middleware to routes that should be accessible only to authenticated users
router.post('/shorten/private', protect, createShortUrl);
router.get('/user/urls', protect, getAllUrls);
router.delete('/user/:id', protect, deleteUrl);

module.exports = router; 
const Url = require('../models/url');

// Create a shortened URL
exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl, frontendUrl } = req.body;

    // Check if URL already exists in the database
    // If user is authenticated, check only among their URLs
    const query = req.user ? { originalUrl, user: req.user._id } : { originalUrl };
    const existingUrl = await Url.findOne(query);
    
    if (existingUrl) {
      return res.status(200).json({
        success: false,
        message: 'This URL is already shortened!',
        url: existingUrl,
      });
    }

    // Generate a short ID
    const shortId = Math.random().toString(36).substring(2, 8);
    
    // Create the short URL using the frontend URL instead of backend URL
    // This fixes the PORT mismatch issue
    const shortUrl = `${frontendUrl}/${shortId}`;

    // Save to database
    const url = new Url({
      originalUrl,
      shortId,
      shortUrl,
      // If user is authenticated, associate URL with user
      ...(req.user && { user: req.user._id }),
    });

    await url.save();

    res.status(201).json({
      success: true,
      message: 'URL shortened successfully!',
      url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Get all shortened URLs
exports.getAllUrls = async (req, res) => {
  try {
    const { frontendUrl } = req.query;
    
    // If user is authenticated, only get their URLs
    // Otherwise get all public URLs (without user)
    const query = req.user ? { user: req.user._id } : { user: { $exists: false } };
    
    const urls = await Url.find(query).sort({ createdAt: -1 });

    // If a frontendUrl is provided, update all URLs to use the correct frontend URL
    if (frontendUrl) {
      for (const url of urls) {
        // Extract the shortId from the current shortUrl (last part after the last slash)
        const shortId = url.shortId;
        
        // Create the new shortUrl with the correct frontend URL
        const newShortUrl = `${frontendUrl}/${shortId}`;
        
        // Update the URL if it's different
        if (url.shortUrl !== newShortUrl) {
          url.shortUrl = newShortUrl;
          await url.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      count: urls.length,
      urls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Get URL by short ID and redirect
exports.redirectToUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    // Increment click count
    url.clicks++;
    await url.save();

    // Send the original URL for redirection
    res.status(200).json({
      success: true,
      originalUrl: url.originalUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Delete a URL
exports.deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the URL
    const url = await Url.findById(id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    // Check if URL belongs to user (if authenticated)
    if (req.user && url.user && url.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this URL',
      });
    }

    // Use findByIdAndDelete instead of remove()
    await Url.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'URL deleted successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}; 
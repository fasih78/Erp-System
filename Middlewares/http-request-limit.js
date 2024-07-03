const rateLimit = require('express-rate-limit');

// Create a rate limiter instance
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1,
  message: "Limit Reached!",
});

// Define the middleware function
const rateLimitMiddleware = (req, res, next) => {
  // Attach the rate limiter to the request object
  req.limit = limiter;

  // Call the next middleware
  next();
};

module.exports = rateLimitMiddleware;

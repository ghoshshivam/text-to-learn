const rateLimit = require("express-rate-limit");

const rateLimitMessage = (message) => ({
  success: false,
  error: { code: "RATE_LIMITED", message },
});

// General limit per IP for the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitMessage("Too many requests. Please slow down."),
});

// Stricter limit per logged-in user for AI routes (they cost money and time).
// Must run AFTER the auth middleware so req.user exists.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user.sub,
  message: rateLimitMessage("AI generation limit reached. Try again later."),
});

module.exports = { apiLimiter, aiLimiter };
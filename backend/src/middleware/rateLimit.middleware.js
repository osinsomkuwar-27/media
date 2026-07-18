import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

// Skipped entirely during automated tests so Jest runs (which register
// many users back-to-back from the same IP) don't get throttled.
const skipInTests = () => env.nodeEnv === 'test';

export const globalLimiter = rateLimit({
  windowMs: env.rateLimit.globalWindowMs,
  max: env.rateLimit.globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
      },
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message: "Too many authentication attempts, please try again later.",
      },
    });
  },
});
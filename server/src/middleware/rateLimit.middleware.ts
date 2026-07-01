import rateLimit from 'express-rate-limit';

// Global rate limiting for general API routes (e.g. 1000 requests per 15 mins)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Stricter rate limiting for authentication routes (login/register) to prevent brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15, // Limit each IP to 15 login requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' }
});

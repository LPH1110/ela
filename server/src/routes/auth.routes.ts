import { Router } from 'express';
import passport from '../config/passport';
import { AuthController } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Local Auth
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);

// Google OAuth
router.get('/google', authLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  AuthController.googleCallback
);

// Profile
router.get('/me', authenticate, AuthController.me);

export default router;

import { Router } from 'express';
import { InviteController } from '../controllers/invite.controller';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Accept an invite (Public route, protected by token)
router.post('/accept', authLimiter, InviteController.accept);

// Create an invite (Protected)
router.post('/', authenticate, InviteController.create);

export default router;

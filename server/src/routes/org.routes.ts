import { Router } from 'express';
import { OrgController } from '../controllers/org.controller';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.middleware';

const router = Router();

// Create new org (User becomes owner)
router.post('/', authenticate, OrgController.create);

// Invite a member (Must be OWNER or ADMIN of the current org)
router.post('/:orgId/invite', authenticate, requireOrg, requireRole('OWNER', 'ADMIN'), OrgController.invite);

// List members
router.get('/:orgId/members', authenticate, requireOrg, OrgController.listMembers);

// Dashboard metrics
router.get('/metrics', authenticate, requireOrg, OrgController.getMetrics);

// Departments catalog
router.get('/departments', authenticate, requireOrg, OrgController.getDepartments);

// Audit logs
router.get('/audit-logs', authenticate, requireOrg, OrgController.getAuditLogs);

export default router;

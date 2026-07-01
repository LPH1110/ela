import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireOrg);

router.post('/', requireRole('OWNER', 'ADMIN'), EmployeeController.createEmployee);
router.get('/', EmployeeController.getEmployees);
router.get('/global-logs', EmployeeController.getGlobalLogs);
router.get('/:id', EmployeeController.getEmployee);
router.get('/:id/logs', EmployeeController.getEmployeeLogs);
router.post('/:id/offboard', requireRole('OWNER', 'ADMIN'), EmployeeController.offboardEmployee);

export default router;

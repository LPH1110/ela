import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';

const router = Router();

router.post('/', EmployeeController.createEmployee);
router.get('/', EmployeeController.getEmployees);
router.get('/global-logs', EmployeeController.getGlobalLogs);
router.get('/:id/logs', EmployeeController.getEmployeeLogs);
router.post('/:id/offboard', EmployeeController.offboardEmployee);

export default router;

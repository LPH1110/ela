import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { onboardingQueue } from '../queues/onboarding.queue';
import { offboardingQueue } from '../queues/offboarding.queue';
import { AppError, ErrorCodes, asyncHandler } from '../utils/errors';

export class EmployeeController {
  
  static createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, personalEmail, department } = req.body;
    const organizationId = req.user?.orgId;
    
    if (!fullName || !personalEmail || !department) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields');
    }
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const employee = await prisma.employee.create({
      data: {
        fullName,
        personalEmail,
        department,
        status: 'ONBOARDING',
        organizationId
      }
    });

    // Add to onboarding queue
    await onboardingQueue.add('onboardEmployee', { employeeId: employee.id, organizationId });

    return res.status(201).json({ message: 'Employee created and onboarding started', data: employee });
  });

  static getEmployees = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.orgId;
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const employees = await prisma.employee.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json({ data: employees });
  });

  static getEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;
    
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const employee = await prisma.employee.findUnique({
      where: { id, organizationId },
      include: { jobLogs: { orderBy: { createdAt: 'desc' } } }
    });
    
    if (!employee) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Employee not found');
    }

    return res.status(200).json({ data: employee });
  });

  static getEmployeeLogs = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;
    
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    // Ensure the employee belongs to this org
    const employee = await prisma.employee.findUnique({ where: { id, organizationId } });
    if (!employee) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Employee not found');
    }

    const logs = await prisma.jobLog.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json({ data: logs });
  });

  static getGlobalLogs = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.orgId;
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const logs = await prisma.jobLog.findMany({
      where: { employee: { organizationId } },
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ data: logs });
  });

  static offboardEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;

    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const employee = await prisma.employee.findUnique({ where: { id, organizationId } });
    
    if (!employee) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Employee not found');
    }

    if (employee.status === 'OFFBOARDED') {
      throw new AppError(400, ErrorCodes.EMPLOYEE_ALREADY_OFFBOARDED, 'Employee is already offboarded');
    }

    // Add to offboarding queue
    await offboardingQueue.add('offboardEmployee', { employeeId: employee.id, organizationId });

    return res.status(200).json({ message: 'Offboarding sequence initiated' });
  });
}

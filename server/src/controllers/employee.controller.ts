import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { onboardingQueue } from '../queues/onboarding.queue';
import { offboardingQueue } from '../queues/offboarding.queue';

export class EmployeeController {
  
  static async createEmployee(req: Request, res: Response) {
    try {
      const { fullName, personalEmail, department } = req.body;
      
      if (!fullName || !personalEmail || !department) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const employee = await prisma.employee.create({
        data: {
          fullName,
          personalEmail,
          department,
          status: 'ONBOARDING'
        }
      });

      // Add to onboarding queue
      await onboardingQueue.add('onboardEmployee', { employeeId: employee.id });

      return res.status(201).json({ message: 'Employee created and onboarding started', data: employee });
    } catch (error) {
      console.error('Error in createEmployee:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEmployees(req: Request, res: Response) {
    try {
      const employees = await prisma.employee.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      return res.status(200).json({ data: employees });
    } catch (error) {
      console.error('Error in getEmployees:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: { jobLogs: { orderBy: { createdAt: 'desc' } } }
      });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      return res.status(200).json({ data: employee });
    } catch (error) {
      console.error('Error in getEmployee:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEmployeeLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const logs = await prisma.jobLog.findMany({
        where: { employeeId: id },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.status(200).json({ data: logs });
    } catch (error) {
      console.error('Error in getEmployeeLogs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getGlobalLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.jobLog.findMany({
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ data: logs });
    } catch (error) {
      console.error('Error in getGlobalLogs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async offboardEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const employee = await prisma.employee.findUnique({ where: { id } });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      if (employee.status === 'OFFBOARDED') {
        return res.status(400).json({ error: 'Employee is already offboarded' });
      }

      // Add to offboarding queue
      await offboardingQueue.add('offboardEmployee', { employeeId: employee.id });

      return res.status(200).json({ message: 'Offboarding sequence initiated' });
    } catch (error) {
      console.error('Error in offboardEmployee:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

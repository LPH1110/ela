import prisma from '../../config/prisma';
import { IntegrationService } from '../integration.service';

export class OffboardingOrchestrator {
  static async execute(employeeId: string, organizationId: string): Promise<void> {
    const log = await prisma.jobLog.create({
      data: {
        employeeId,
        action: 'IT_OFFBOARDING',
        status: 'PROCESSING',
        message: 'Starting IT offboarding sequence (deprovisioning)...'
      }
    });

    const results = await IntegrationService.runPipeline({
      employeeId,
      organizationId,
      action: 'OFFBOARD'
    });
    
    const allSucceeded = results.every(r => r.success);
    await prisma.jobLog.update({
      where: { id: log.id },
      data: {
        status: allSucceeded ? 'SUCCESS' : 'PARTIAL_FAILURE',
        message: allSucceeded
          ? 'Completed IT offboarding sequence successfully.'
          : `Partial failure: ${results.filter(r => !r.success).map(r => r.provider).join(', ')}`
      }
    });

    await prisma.employee.update({
      where: { id: employeeId },
      data: { status: 'OFFBOARDED' }
    });
  }
}

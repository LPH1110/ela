import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import prisma from '../config/prisma';

export const offboardingQueue = new Queue('offboardingQueue', { connection: redisConfig });

export const offboardingWorker = new Worker('offboardingQueue', async (job: Job) => {
  const { employeeId } = job.data;
  
  console.log(`[Offboarding Worker] Processing job ${job.id} for employee: ${employeeId}`);
  
  // Create an initial job log
  const log = await prisma.jobLog.create({
    data: {
      employeeId,
      action: 'IT_OFFBOARDING',
      status: 'PROCESSING',
      message: 'Starting IT offboarding sequence (deprovisioning)...'
    }
  });

  // Simulate third-party API communication for offboarding
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update log success
  await prisma.jobLog.update({
    where: { id: log.id },
    data: {
      status: 'SUCCESS',
      message: 'Completed IT offboarding sequence successfully.'
    }
  });

  // Finally update employee status
  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: 'OFFBOARDED' }
  });
  
  console.log(`[Offboarding Worker] Successfully offboarded employee: ${employeeId}`);
}, { connection: redisConfig });

offboardingWorker.on('failed', async (job, err) => {
  console.error(`[Offboarding Worker] Job ${job?.id} failed with error ${err.message}`);
  if (job?.data?.employeeId) {
    await prisma.jobLog.create({
      data: {
        employeeId: job.data.employeeId,
        action: 'IT_OFFBOARDING',
        status: 'FAILED',
        message: err.message
      }
    });
  }
});

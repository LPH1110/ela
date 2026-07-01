import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import prisma from '../config/prisma';
import { EmailService } from '../services/email.service';

export const onboardingQueue = new Queue('onboardingQueue', { connection: redisConfig });

export const onboardingWorker = new Worker('onboardingQueue', async (job: Job) => {
  const { employeeId } = job.data;
  
  console.log(`[Onboarding Worker] Processing job ${job.id} for employee: ${employeeId}`);
  
  // Create an initial job log
  const log = await prisma.jobLog.create({
    data: {
      employeeId,
      action: 'IT_ONBOARDING',
      status: 'PROCESSING',
      message: 'Starting IT onboarding sequence...'
    }
  });

  // Simulate third-party integration logic (e.g. GitHub, Slack, Jira)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update log success
  await prisma.jobLog.update({
    where: { id: log.id },
    data: {
      status: 'SUCCESS',
      message: 'Completed IT onboarding sequence successfully.'
    }
  });

  // Finally update employee status
  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { status: 'ACTIVE' },
    include: { organization: true }
  });
  
  // Send email notification to the new employee
  if (employee.personalEmail) {
    try {
        await EmailService.sendOnboardingWelcome(
            employee.personalEmail, 
            employee.fullName, 
            employee.organization.name
        );
    } catch (emailErr) {
        console.error(`[Onboarding Worker] Failed to send email to ${employee.personalEmail}`, emailErr);
    }
  }

  console.log(`[Onboarding Worker] Successfully onboarded employee: ${employeeId}`);
}, { connection: redisConfig });

onboardingWorker.on('failed', async (job, err) => {
  console.error(`[Onboarding Worker] Job ${job?.id} failed with error ${err.message}`);
  if (job?.data?.employeeId) {
    await prisma.jobLog.create({
      data: {
        employeeId: job.data.employeeId,
        action: 'IT_ONBOARDING',
        status: 'FAILED',
        message: err.message
      }
    });
  }
});

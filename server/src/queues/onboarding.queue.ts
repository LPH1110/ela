import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { OnboardingOrchestrator } from '../integrations/orchestrators/onboarding.orchestrator';

export const onboardingQueue = new Queue('onboardingQueue', { connection: redisConfig });

export const onboardingWorker = new Worker('onboardingQueue', async (job: Job) => {
  const { employeeId, organizationId } = job.data;
  
  console.log(`[Onboarding Worker] Processing job ${job.id} for employee: ${employeeId}`);
  await OnboardingOrchestrator.execute(employeeId, organizationId);
  console.log(`[Onboarding Worker] Completed job ${job.id}`);
}, { connection: redisConfig });

onboardingWorker.on('failed', async (job, err) => {
  console.error(`[Onboarding Worker] Job ${job?.id} failed with error ${err.message}`);
});

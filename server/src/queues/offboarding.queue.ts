import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { OffboardingOrchestrator } from '../integrations/orchestrators/offboarding.orchestrator';

export const offboardingQueue = new Queue('offboardingQueue', { connection: redisConfig });

export const offboardingWorker = new Worker('offboardingQueue', async (job: Job) => {
  const { employeeId, organizationId } = job.data;
  
  console.log(`[Offboarding Worker] Processing job ${job.id} for employee: ${employeeId}`);
  await OffboardingOrchestrator.execute(employeeId, organizationId);
  console.log(`[Offboarding Worker] Completed job ${job.id}`);
}, { connection: redisConfig });

offboardingWorker.on('failed', async (job, err) => {
  console.error(`[Offboarding Worker] Job ${job?.id} failed with error ${err.message}`);
});

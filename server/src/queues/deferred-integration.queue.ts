import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { IntegrationService } from '../integrations/integration.service';

interface DeferredIntegrationJob {
  employeeId: string;
  organizationId: string;
  provider: string;
}

export const deferredIntegrationQueue = new Queue('deferredIntegrationQueue', { connection: redisConfig });

export const deferredIntegrationWorker = new Worker('deferredIntegrationQueue', async (job: Job) => {
  const { employeeId, organizationId, provider } = job.data as DeferredIntegrationJob;

  console.log(`[Deferred Integration Worker] Processing job ${job.id} for employee: ${employeeId} provider: ${provider}`);

  const results = await IntegrationService.runPipeline({
    employeeId,
    organizationId,
    action: 'ONBOARD',
    providerFilter: provider
  });

  const result = results[0];
  if (result && !result.success && result.retryable) {
    throw new Error(result.message); // triggers BullMQ retry
  }
}, { connection: redisConfig });

deferredIntegrationWorker.on('failed', async (job, err) => {
  console.error(`[Deferred Integration Worker] Job ${job?.id} failed with error ${err.message}`);
});

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import inviteRoutes from './routes/invite.routes';
import employeeRoutes from './routes/employee.routes';
import integrationRoutes from './routes/integration.routes';

import { initProviders } from './integrations/providers';

// Import queues to ensure workers are initialized
import { onboardingQueue } from './queues/onboarding.queue';
import { deferredIntegrationQueue } from './queues/deferred-integration.queue';
import { offboardingQueue } from './queues/offboarding.queue';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/invitations', inviteRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/integrations', integrationRoutes);

// BullMQ Dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [
    new BullMQAdapter(onboardingQueue),
    new BullMQAdapter(deferredIntegrationQueue),
    new BullMQAdapter(offboardingQueue)
  ],
  serverAdapter: serverAdapter,
  options: {
    uiConfig: {
      boardTitle: 'ELA Queue Dashboard'
    }
  }
});
app.use('/admin/queues', serverAdapter.getRouter());

// Healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Centralized Global Error Handler (must be registered last)
import { errorHandler } from './middleware/error.middleware';
app.use(errorHandler);

app.listen(env.PORT, () => {
  // Initialize integrations
  initProviders();
  console.log(`Server is running on port ${env.PORT}`);
});

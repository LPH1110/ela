import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import inviteRoutes from './routes/invite.routes';
import employeeRoutes from './routes/employee.routes';

// Import queues to ensure workers are initialized
import './queues/onboarding.queue';
import './queues/offboarding.queue';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/invitations', inviteRoutes);
app.use('/api/employees', employeeRoutes);

// Healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Centralized Global Error Handler (must be registered last)
import { errorHandler } from './middleware/error.middleware';
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

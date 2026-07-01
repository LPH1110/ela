import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import employeeRoutes from './routes/employee.routes';

// Import queues to ensure workers are initialized
import './queues/onboarding.queue';
import './queues/offboarding.queue';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);

// Healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL as string,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY as string,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'secret123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'secret456',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,

  SMTP_HOST: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '2525', 10),
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,

  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID as string,
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET as string,
};

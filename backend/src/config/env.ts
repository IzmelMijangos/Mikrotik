import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mikrotik: {
    defaultPort: parseInt(process.env.MIKROTIK_DEFAULT_PORT || '8728', 10),
    useSsl: process.env.MIKROTIK_USE_SSL === 'true',
  },
};

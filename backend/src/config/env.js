import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongodbUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  defaultWalletBalance: parseInt(process.env.DEFAULT_WALLET_BALANCE, 10) || 100,

  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:8081',

  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,

  storageProvider: process.env.STORAGE_PROVIDER || 's3rver',

  rateLimit: {
    globalWindowMs: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10) || 15 * 60 * 1000,
    globalMax: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10) || 100,
    authWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 15 * 60 * 1000,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10,
  },
};

const requiredInProduction = ['mongodbUri', 'jwtSecret'];

if (env.nodeEnv === 'production') {
  for (const key of requiredInProduction) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable for key: ${key}`);
    }
  }
}

export default env;
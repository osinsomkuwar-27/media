import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import routes from './routes/index.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: env.nodeEnv,
    },
  });
});

app.use('/api/v1', routes);
app.use(errorHandler);

// Simple health check — confirms the process is up and (once added)
// that we can report DB connection state.
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: env.nodeEnv,
    },
  });
});

// 404 handler for anything not matched above.
// Full centralized error handling middleware comes in Phase 3.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});
app.use(errorHandler);

export default app;
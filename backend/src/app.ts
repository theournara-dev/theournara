// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import router from './routes';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';

const app: Application = express();

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Trust reverse proxy headers in hosted environments
app.set('trust proxy', true);

// Middleware
app.use(cors({ origin: 'https://theournara-backend.vercel.app', credentials: true })); // Adjust origin in production
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (placeholder, can be configured later)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Logging (using morgan with winston)
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// API routes
app.use('/api', router);

// Global error handler
app.use(errorHandler);

export default app;

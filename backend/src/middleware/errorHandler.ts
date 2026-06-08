// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface HttpError extends Error {
  status?: number;
}

export default function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error ${status}: ${message}`, { stack: err.stack, path: _req.path });

  res.status(status).json({
    success: false,
    message,
    data: null,
    errors: [{ code: status, message }],
  });
}

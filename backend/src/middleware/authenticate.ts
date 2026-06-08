// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[]; // List of role names
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      data: null,
      errors: [{ message: 'No authorization token was provided' }]
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      email: string;
      roles: string[];
    };
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid access token',
      data: null,
      errors: [{ message: 'Authorization token is expired or invalid' }]
    });
  }
}

export function authenticateOptional(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      email: string;
      roles: string[];
    };
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
    };
  } catch (error) {
    // Ignore invalid token in optional authentication
  }
  next();
}

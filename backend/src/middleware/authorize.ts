// src/middleware/authorize.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

export function authorize(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null,
        errors: [{ message: 'User must be authenticated to access this resource' }]
      });
    }

    const hasRole = req.user.roles.some((role) => 
      allowedRoles.some((allowed) => allowed.toLowerCase() === role.toLowerCase())
    );
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        data: null,
        errors: [{ message: 'You do not have the required permissions to access this resource' }]
      });
    }

    next();
  };
}

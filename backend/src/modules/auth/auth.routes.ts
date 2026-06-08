// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { register, login, refreshToken, logout, listUsers, updateUserRole } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from './auth.validator';
import { authenticate, authenticateOptional } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', validate({ body: refreshSchema }), refreshToken);
router.post('/logout', authenticateOptional, logout);

// Admin-only User/Role management routes
router.get('/users', authenticate, authorize(['Admin', 'Manager']), listUsers);
router.put('/users/:id/role', authenticate, authorize(['Admin']), updateUserRole);

export default router;
export { router as authRouter };

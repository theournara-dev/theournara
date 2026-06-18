// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { sendSuccess, sendError } from '../../utils/response';
import prisma from '../../prisma/client';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await AuthService.register({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
    });

    const { accessToken, refreshToken } = AuthService.generateTokens(user);

    // Send welcome email (non-blocking)
    EmailService.sendWelcomeEmail(user.email, user.firstName || 'Beauty Lover');

    // Set refresh token in HttpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, { user, accessToken }, 'Registration successful', 211);
  } catch (error: any) {
    if (error.message.includes('already registered')) {
      return sendError(res, [{ message: error.message }], error.message, 400);
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await AuthService.validateUser(email, password);
    const { accessToken, refreshToken } = AuthService.generateTokens(user);

    // Send login alert email (non-blocking)
    EmailService.sendLoginAlert(user.email, user.firstName || 'there');

    // Set refresh token in HttpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, { user, accessToken }, 'Login successful');
  } catch (error: any) {
    return sendError(res, [{ message: error.message }], error.message, 401);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!token) {
      return sendError(res, [{ message: 'Refresh token is required' }], 'Unauthorized', 401);
    }

    const userId = AuthService.verifyRefreshToken(token);
    const user = await AuthService.getUserById(userId);
    const tokens = AuthService.generateTokens(user);

    // Set new refresh token in HttpOnly cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
  } catch (error: any) {
    return sendError(res, [{ message: error.message }], error.message, 401);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return sendSuccess(res, {}, 'Logout successful');
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      createdAt: u.createdAt,
      roles: u.roles.map(r => r.role.name)
    }));

    return sendSuccess(res, formattedUsers, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { roles } = req.body; // array of role names, e.g. ["Admin", "User"]

    // Delete existing roles
    await prisma.userRole.deleteMany({
      where: { userId: id }
    });

    // Create new roles
    for (const roleName of roles) {
      let role = await prisma.role.findUnique({
        where: { name: roleName }
      });
      if (!role) {
        role = await prisma.role.create({
          data: { name: roleName }
        });
      }
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: role.id
        }
      });
    }

    return sendSuccess(res, {}, 'User roles updated successfully');
  } catch (error: any) {
    return sendError(res, [{ message: error.message }], error.message, 400);
  }
}

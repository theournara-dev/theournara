// src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import prisma from '../../prisma/client';

export interface UserTokenPayload {
  sub: string;
  email: string;
  roles: string[];
}

export class AuthService {
  static async register(data: { email: string; passwordHash: string; firstName?: string; lastName?: string; phone?: string }) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email is already registered');
    }

    // Find default User role
    let userRole = await prisma.role.findUnique({ where: { name: 'User' } });
    if (!userRole) {
      userRole = await prisma.role.create({
        data: { name: 'User', description: 'Default user' }
      });
    }

    // Create User, Profile, and UserRole
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        profile: {
          create: {}
        },
        roles: {
          create: {
            roleId: userRole.id
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => r.role.name)
    };
  }

  static async validateUser(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user || user.isDeleted) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => r.role.name)
    };
  }

  static generateTokens(user: { id: string; email: string; roles: string[] }) {
    const payload: UserTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiresIn as any,
    });

    const refreshToken = jwt.sign({ sub: user.id }, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  static verifyRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret) as { sub: string };
      return decoded.sub;
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user || user.isDeleted) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => r.role.name)
    };
  }
}

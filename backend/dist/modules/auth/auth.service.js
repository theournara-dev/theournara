"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/modules/auth/auth.service.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const client_1 = __importDefault(require("../../prisma/client"));
class AuthService {
    static async register(data) {
        // Check if user exists
        const existing = await client_1.default.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new Error('Email is already registered');
        }
        // Find default User role
        let userRole = await client_1.default.role.findUnique({ where: { name: 'User' } });
        if (!userRole) {
            userRole = await client_1.default.role.create({
                data: { name: 'User', description: 'Default user' }
            });
        }
        // Create User, Profile, and UserRole
        const user = await client_1.default.user.create({
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
    static async validateUser(email, passwordPlain) {
        const user = await client_1.default.user.findUnique({
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
        const isMatch = await bcrypt_1.default.compare(passwordPlain, user.passwordHash);
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
    static generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret, {
            expiresIn: config_1.default.jwtAccessExpiresIn,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id }, config_1.default.jwtRefreshSecret, {
            expiresIn: config_1.default.jwtRefreshExpiresIn,
        });
        return { accessToken, refreshToken };
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtRefreshSecret);
            return decoded.sub;
        }
        catch (err) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    static async getUserById(userId) {
        const user = await client_1.default.user.findUnique({
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
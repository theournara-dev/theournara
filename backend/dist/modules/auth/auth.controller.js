"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.listUsers = listUsers;
exports.updateUserRole = updateUserRole;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
const client_1 = __importDefault(require("../../prisma/client"));
async function register(req, res, next) {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await auth_service_1.AuthService.register({
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
        });
        const { accessToken, refreshToken } = auth_service_1.AuthService.generateTokens(user);
        // Set refresh token in HttpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return (0, response_1.sendSuccess)(res, { user, accessToken }, 'Registration successful', 211);
    }
    catch (error) {
        if (error.message.includes('already registered')) {
            return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
        }
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await auth_service_1.AuthService.validateUser(email, password);
        const { accessToken, refreshToken } = auth_service_1.AuthService.generateTokens(user);
        // Set refresh token in HttpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return (0, response_1.sendSuccess)(res, { user, accessToken }, 'Login successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 401);
    }
}
async function refreshToken(req, res, next) {
    try {
        let token = req.cookies?.refresh_token || req.body?.refreshToken;
        if (!token) {
            return (0, response_1.sendError)(res, [{ message: 'Refresh token is required' }], 'Unauthorized', 401);
        }
        const userId = auth_service_1.AuthService.verifyRefreshToken(token);
        const user = await auth_service_1.AuthService.getUserById(userId);
        const tokens = auth_service_1.AuthService.generateTokens(user);
        // Set new refresh token in HttpOnly cookie
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return (0, response_1.sendSuccess)(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 401);
    }
}
async function logout(req, res, next) {
    try {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return (0, response_1.sendSuccess)(res, {}, 'Logout successful');
    }
    catch (error) {
        next(error);
    }
}
async function listUsers(req, res, next) {
    try {
        const users = await client_1.default.user.findMany({
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
        return (0, response_1.sendSuccess)(res, formattedUsers, 'Users retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function updateUserRole(req, res, next) {
    try {
        const { id } = req.params;
        const { roles } = req.body; // array of role names, e.g. ["Admin", "User"]
        // Delete existing roles
        await client_1.default.userRole.deleteMany({
            where: { userId: id }
        });
        // Create new roles
        for (const roleName of roles) {
            let role = await client_1.default.role.findUnique({
                where: { name: roleName }
            });
            if (!role) {
                role = await client_1.default.role.create({
                    data: { name: roleName }
                });
            }
            await client_1.default.userRole.create({
                data: {
                    userId: id,
                    roleId: role.id
                }
            });
        }
        return (0, response_1.sendSuccess)(res, {}, 'User roles updated successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
    }
}
//# sourceMappingURL=auth.controller.js.map
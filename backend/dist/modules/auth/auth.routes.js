"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
// src/modules/auth/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const auth_validator_1 = require("./auth.validator");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
exports.authRouter = router;
router.post('/register', (0, validate_1.validate)({ body: auth_validator_1.registerSchema }), auth_controller_1.register);
router.post('/login', (0, validate_1.validate)({ body: auth_validator_1.loginSchema }), auth_controller_1.login);
router.post('/refresh', (0, validate_1.validate)({ body: auth_validator_1.refreshSchema }), auth_controller_1.refreshToken);
router.post('/logout', authenticate_1.authenticateOptional, auth_controller_1.logout);
// Admin-only User/Role management routes
router.get('/users', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin', 'Manager']), auth_controller_1.listUsers);
router.put('/users/:id/role', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), auth_controller_1.updateUserRole);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
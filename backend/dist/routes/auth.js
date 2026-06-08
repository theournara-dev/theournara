"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authValidator_1 = require("../validators/authValidator");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', authValidator_1.validateRegister, authController_1.register);
router.post('/login', authValidator_1.validateLogin, authController_1.login);
router.post('/refresh', authValidator_1.validateRefresh, authController_1.refreshToken);
router.post('/logout', authenticate_1.authenticateOptional, authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map
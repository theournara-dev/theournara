"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authenticateOptional = authenticateOptional;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.cookies && req.cookies.access_token) {
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            roles: decoded.roles || [],
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid access token',
            data: null,
            errors: [{ message: 'Authorization token is expired or invalid' }]
        });
    }
}
function authenticateOptional(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    }
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            roles: decoded.roles || [],
        };
    }
    catch (error) {
        // Ignore invalid token in optional authentication
    }
    next();
}
//# sourceMappingURL=authenticate.js.map
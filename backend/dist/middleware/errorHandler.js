"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    logger_1.default.error(`Error ${status}: ${message}`, { stack: err.stack, path: _req.path });
    res.status(status).json({
        success: false,
        message,
        data: null,
        errors: [{ code: status, message }],
    });
}
//# sourceMappingURL=errorHandler.js.map
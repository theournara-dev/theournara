"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        errors: []
    });
}
function sendError(res, errors = [], message = 'Error occurred', statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        errors
    });
}
//# sourceMappingURL=response.js.map
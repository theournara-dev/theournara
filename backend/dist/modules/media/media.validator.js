"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMediaSchema = void 0;
const zod_1 = require("zod");
exports.uploadMediaSchema = zod_1.z.object({
    // In a real scenario, validation happens via multer or similar, 
    // but for mock/placeholder we accept URL, mimeType, size
    url: zod_1.z.string().url(),
    mimeType: zod_1.z.string(),
    size: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=media.validator.js.map
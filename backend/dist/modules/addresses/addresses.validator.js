"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    line1: zod_1.z.string().min(1, 'Address Line 1 is required'),
    line2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    zipCode: zod_1.z.string().min(1, 'Zip/postal code is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    isDefault: zod_1.z.boolean().optional().default(false),
});
exports.updateAddressSchema = exports.createAddressSchema.partial();
//# sourceMappingURL=addresses.validator.js.map
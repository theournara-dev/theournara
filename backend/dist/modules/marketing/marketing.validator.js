"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFlashSaleSchema = exports.createOfferSchema = exports.updateCouponSchema = exports.createCouponSchema = void 0;
const zod_1 = require("zod");
exports.createCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(50),
    discountType: zod_1.z.enum(['percentage', 'amount']),
    discountValue: zod_1.z.number().positive(),
    expiresAt: zod_1.z.string().datetime().optional(),
    usageLimit: zod_1.z.number().int().positive().optional(),
    minOrderValue: zod_1.z.number().positive().optional(),
});
exports.updateCouponSchema = zod_1.z.object({
    discountType: zod_1.z.enum(['percentage', 'amount']).optional(),
    discountValue: zod_1.z.number().positive().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    usageLimit: zod_1.z.number().int().positive().optional(),
    minOrderValue: zod_1.z.number().positive().optional(),
});
exports.createOfferSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    discountPercentage: zod_1.z.number().positive().max(100),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    productIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.createFlashSaleSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    discountPercentage: zod_1.z.number().positive().max(100),
    products: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        discountPrice: zod_1.z.number().positive(),
        stockLimit: zod_1.z.number().int().positive(),
    })),
});
//# sourceMappingURL=marketing.validator.js.map
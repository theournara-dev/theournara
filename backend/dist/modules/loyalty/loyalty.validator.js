"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReferralSchema = exports.createRewardSchema = exports.redeemPointsSchema = exports.addPointsSchema = void 0;
const zod_1 = require("zod");
exports.addPointsSchema = zod_1.z.object({
    points: zod_1.z.number().int().refine((val) => val !== 0, {
        message: 'Points cannot be zero',
    }),
    description: zod_1.z.string().optional(),
});
exports.redeemPointsSchema = zod_1.z.object({
    rewardId: zod_1.z.string().uuid(),
});
exports.createRewardSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    pointsCost: zod_1.z.number().int().positive(),
    description: zod_1.z.string().optional(),
});
exports.createReferralSchema = zod_1.z.object({
    refereeEmail: zod_1.z.string().email(),
});
//# sourceMappingURL=loyalty.validator.js.map
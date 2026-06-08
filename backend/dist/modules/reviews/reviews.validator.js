"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnswerSchema = exports.createQuestionSchema = exports.voteReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
exports.voteReviewSchema = zod_1.z.object({
    vote: zod_1.z.number().int().refine((val) => val === 1 || val === -1, {
        message: 'Vote must be 1 (upvote) or -1 (downvote)',
    }),
});
exports.createQuestionSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(5).max(255),
});
exports.createAnswerSchema = zod_1.z.object({
    content: zod_1.z.string().min(5).max(1000),
});
//# sourceMappingURL=reviews.validator.js.map
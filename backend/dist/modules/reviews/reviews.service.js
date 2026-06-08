"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class ReviewsService {
    // === REVIEWS ===
    static async createReview(userId, data) {
        // Optional: check if user has bought the product
        return client_1.default.review.create({
            data: {
                userId,
                productId: data.productId,
                rating: data.rating,
                comment: data.comment,
            },
        });
    }
    static async getProductReviews(productId) {
        return client_1.default.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
                },
                votes: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async voteReview(userId, reviewId, vote) {
        return client_1.default.reviewVote.upsert({
            where: {
                reviewId_userId: { reviewId, userId },
            },
            update: { vote },
            create: { reviewId, userId, vote },
        });
    }
    static async deleteReview(reviewId, userId, isAdmin = false) {
        if (isAdmin) {
            return client_1.default.review.delete({ where: { id: reviewId } });
        }
        // User can only delete their own review
        return client_1.default.review.delete({
            where: { id: reviewId, userId },
        });
    }
    // === QUESTIONS & ANSWERS ===
    static async createQuestion(userId, data) {
        return client_1.default.question.create({
            data: {
                userId,
                productId: data.productId,
                title: data.title,
            },
        });
    }
    static async getProductQuestions(productId) {
        return client_1.default.question.findMany({
            where: { productId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
                answers: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async createAnswer(userId, questionId, content) {
        return client_1.default.answer.create({
            data: {
                userId,
                questionId,
                content,
            },
        });
    }
    static async deleteQuestion(questionId, userId, isAdmin = false) {
        if (isAdmin) {
            return client_1.default.question.delete({ where: { id: questionId } });
        }
        return client_1.default.question.delete({
            where: { id: questionId, userId },
        });
    }
    static async deleteAnswer(answerId, userId, isAdmin = false) {
        if (isAdmin) {
            return client_1.default.answer.delete({ where: { id: answerId } });
        }
        return client_1.default.answer.delete({
            where: { id: answerId, userId },
        });
    }
    static async listAllReviews() {
        return client_1.default.review.findMany({
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                product: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.ReviewsService = ReviewsService;
//# sourceMappingURL=reviews.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const reviews_service_1 = require("./reviews.service");
const response_1 = require("../../utils/response");
class ReviewsController {
    // === REVIEWS ===
    static async createReview(req, res, next) {
        try {
            const userId = req.user.id;
            const review = await reviews_service_1.ReviewsService.createReview(userId, req.body);
            (0, response_1.sendSuccess)(res, review, 'Review created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductReviews(req, res, next) {
        try {
            const { productId } = req.params;
            const reviews = await reviews_service_1.ReviewsService.getProductReviews(productId);
            (0, response_1.sendSuccess)(res, reviews, 'Reviews fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async voteReview(req, res, next) {
        try {
            const userId = req.user.id;
            const { id: reviewId } = req.params;
            const { vote } = req.body;
            const reviewVote = await reviews_service_1.ReviewsService.voteReview(userId, reviewId, vote);
            (0, response_1.sendSuccess)(res, reviewVote, 'Vote recorded successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteReview(req, res, next) {
        try {
            const userId = req.user.id;
            const { id: reviewId } = req.params;
            // Simple role check for admin (assume attached to req.user)
            const isAdmin = req.user.roles?.some((r) => r.role.name === 'admin');
            await reviews_service_1.ReviewsService.deleteReview(reviewId, userId, isAdmin);
            (0, response_1.sendSuccess)(res, {}, 'Review deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    // === QUESTIONS & ANSWERS ===
    static async createQuestion(req, res, next) {
        try {
            const userId = req.user.id;
            const question = await reviews_service_1.ReviewsService.createQuestion(userId, req.body);
            (0, response_1.sendSuccess)(res, question, 'Question created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductQuestions(req, res, next) {
        try {
            const { productId } = req.params;
            const questions = await reviews_service_1.ReviewsService.getProductQuestions(productId);
            (0, response_1.sendSuccess)(res, questions, 'Questions fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async createAnswer(req, res, next) {
        try {
            const userId = req.user.id;
            const { id: questionId } = req.params;
            const answer = await reviews_service_1.ReviewsService.createAnswer(userId, questionId, req.body.content);
            (0, response_1.sendSuccess)(res, answer, 'Answer created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteQuestion(req, res, next) {
        try {
            const userId = req.user.id;
            const { id: questionId } = req.params;
            const isAdmin = req.user.roles?.some((r) => r.role.name === 'admin');
            await reviews_service_1.ReviewsService.deleteQuestion(questionId, userId, isAdmin);
            (0, response_1.sendSuccess)(res, {}, 'Question deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAnswer(req, res, next) {
        try {
            const userId = req.user.id;
            const { id: answerId } = req.params;
            const isAdmin = req.user.roles?.some((r) => r.role.name === 'admin');
            await reviews_service_1.ReviewsService.deleteAnswer(answerId, userId, isAdmin);
            (0, response_1.sendSuccess)(res, {}, 'Answer deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async listAllReviews(req, res, next) {
        try {
            const reviews = await reviews_service_1.ReviewsService.listAllReviews();
            (0, response_1.sendSuccess)(res, reviews, 'All reviews fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewsController = ReviewsController;
//# sourceMappingURL=reviews.controller.js.map
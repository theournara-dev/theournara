"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const validate_1 = require("../../middleware/validate");
const reviews_validator_1 = require("./reviews.validator");
const router = (0, express_1.Router)();
// Reviews
router.post('/', authenticate_1.authenticate, (0, validate_1.validate)({ body: reviews_validator_1.createReviewSchema }), reviews_controller_1.ReviewsController.createReview);
router.get('/product/:productId', reviews_controller_1.ReviewsController.getProductReviews);
router.post('/:id/vote', authenticate_1.authenticate, (0, validate_1.validate)({ body: reviews_validator_1.voteReviewSchema }), reviews_controller_1.ReviewsController.voteReview);
router.delete('/:id', authenticate_1.authenticate, reviews_controller_1.ReviewsController.deleteReview);
router.get('/admin/all', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin', 'Manager']), reviews_controller_1.ReviewsController.listAllReviews);
// Questions
router.post('/questions', authenticate_1.authenticate, (0, validate_1.validate)({ body: reviews_validator_1.createQuestionSchema }), reviews_controller_1.ReviewsController.createQuestion);
router.get('/questions/product/:productId', reviews_controller_1.ReviewsController.getProductQuestions);
router.delete('/questions/:id', authenticate_1.authenticate, reviews_controller_1.ReviewsController.deleteQuestion);
// Answers
router.post('/questions/:id/answers', authenticate_1.authenticate, (0, validate_1.validate)({ body: reviews_validator_1.createAnswerSchema }), reviews_controller_1.ReviewsController.createAnswer);
router.delete('/answers/:id', authenticate_1.authenticate, reviews_controller_1.ReviewsController.deleteAnswer);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map
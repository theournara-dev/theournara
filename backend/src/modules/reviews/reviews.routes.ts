import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createReviewSchema,
  voteReviewSchema,
  createQuestionSchema,
  createAnswerSchema,
} from './reviews.validator';

const router = Router();

// Reviews
router.post('/', authenticate, validate({ body: createReviewSchema }), ReviewsController.createReview);
router.get('/product/:productId', ReviewsController.getProductReviews);
router.post('/:id/vote', authenticate, validate({ body: voteReviewSchema }), ReviewsController.voteReview);
router.delete('/:id', authenticate, ReviewsController.deleteReview);
router.get('/admin/all', authenticate, authorize(['Admin', 'Manager']), ReviewsController.listAllReviews);

// Questions
router.post('/questions', authenticate, validate({ body: createQuestionSchema }), ReviewsController.createQuestion);
router.get('/questions/product/:productId', ReviewsController.getProductQuestions);
router.delete('/questions/:id', authenticate, ReviewsController.deleteQuestion);

// Answers
router.post('/questions/:id/answers', authenticate, validate({ body: createAnswerSchema }), ReviewsController.createAnswer);
router.delete('/answers/:id', authenticate, ReviewsController.deleteAnswer);

export default router;

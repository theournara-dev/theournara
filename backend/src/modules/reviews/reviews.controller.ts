import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from './reviews.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export class ReviewsController {
  // === REVIEWS ===
  static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const review = await ReviewsService.createReview(userId, req.body);
      sendSuccess(res, review, 'Review created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const reviews = await ReviewsService.getProductReviews(productId);
      sendSuccess(res, reviews, 'Reviews fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async voteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: reviewId } = req.params;
      const { vote } = req.body;
      const reviewVote = await ReviewsService.voteReview(userId, reviewId, vote);
      sendSuccess(res, reviewVote, 'Vote recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: reviewId } = req.params;
      // Simple role check for admin (assume attached to req.user)
      const isAdmin = req.user!.roles?.some((r: any) => r.role.name === 'admin');
      
      await ReviewsService.deleteReview(reviewId, userId, isAdmin);
      sendSuccess(res, {}, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // === QUESTIONS & ANSWERS ===
  static async createQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const question = await ReviewsService.createQuestion(userId, req.body);
      sendSuccess(res, question, 'Question created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProductQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const questions = await ReviewsService.getProductQuestions(productId);
      sendSuccess(res, questions, 'Questions fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: questionId } = req.params;
      const answer = await ReviewsService.createAnswer(userId, questionId, req.body.content);
      sendSuccess(res, answer, 'Answer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: questionId } = req.params;
      const isAdmin = req.user!.roles?.some((r: any) => r.role.name === 'admin');
      
      await ReviewsService.deleteQuestion(questionId, userId, isAdmin);
      sendSuccess(res, {}, 'Question deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: answerId } = req.params;
      const isAdmin = req.user!.roles?.some((r: any) => r.role.name === 'admin');
      
      await ReviewsService.deleteAnswer(answerId, userId, isAdmin);
      sendSuccess(res, {}, 'Answer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewsService.listAllReviews();
      sendSuccess(res, reviews, 'All reviews fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

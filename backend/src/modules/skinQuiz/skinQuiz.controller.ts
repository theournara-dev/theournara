import { Request, Response, NextFunction } from 'express';
import { SkinQuizService } from './skinQuiz.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export class SkinQuizController {
  static async getQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const questions = await SkinQuizService.getQuestions();
      sendSuccess(res, questions, 'Quiz questions fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async submitResponses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { responses } = req.body;
      const result = await SkinQuizService.submitResponses(userId, responses);
      sendSuccess(res, result, 'Quiz responses submitted and recommendations generated');
    } catch (error) {
      next(error);
    }
  }
}

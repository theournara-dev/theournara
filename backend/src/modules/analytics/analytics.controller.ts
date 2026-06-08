import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response';

export class AnalyticsController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AnalyticsService.getDashboardMetrics();
      sendSuccess(res, metrics, 'Dashboard metrics fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

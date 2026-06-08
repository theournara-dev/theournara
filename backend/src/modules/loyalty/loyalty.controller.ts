import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from './loyalty.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export class LoyaltyController {
  static async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const balance = await LoyaltyService.getUserBalance(userId);
      sendSuccess(res, { balance }, 'Loyalty balance fetched');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const history = await LoyaltyService.getTransactionHistory(userId);
      sendSuccess(res, history, 'Transaction history fetched');
    } catch (error) {
      next(error);
    }
  }

  static async addPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params; // Admin adding points to a user
      const { points, description } = req.body;
      const transaction = await LoyaltyService.addTransaction(userId, points, description);
      sendSuccess(res, transaction, 'Points added successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const rewards = await LoyaltyService.getRewards();
      sendSuccess(res, rewards, 'Rewards fetched');
    } catch (error) {
      next(error);
    }
  }

  static async createReward(req: Request, res: Response, next: NextFunction) {
    try {
      const reward = await LoyaltyService.createReward(req.body);
      sendSuccess(res, reward, 'Reward created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async redeemReward(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { rewardId } = req.body;
      const result = await LoyaltyService.redeemReward(userId, rewardId);
      sendSuccess(res, result, 'Reward redeemed successfully');
    } catch (error: any) {
      if (error.message === 'Insufficient points' || error.message === 'Reward not found') {
        return sendError(res, [{ message: error.message }], error.message, 400);
      }
      next(error);
    }
  }

  static async createReferral(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { refereeEmail } = req.body;
      const referral = await LoyaltyService.createReferral(userId, refereeEmail);
      sendSuccess(res, referral, 'Referral created', 201);
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        return sendError(res, [{ message: error.message }], error.message, 400);
      }
      next(error);
    }
  }

  static async getReferrals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const referrals = await LoyaltyService.getUserReferrals(userId);
      sendSuccess(res, referrals, 'Referrals fetched');
    } catch (error) {
      next(error);
    }
  }
}

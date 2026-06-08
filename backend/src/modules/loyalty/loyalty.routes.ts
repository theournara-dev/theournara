import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  addPointsSchema,
  redeemPointsSchema,
  createRewardSchema,
  createReferralSchema,
} from './loyalty.validator';

const router = Router();

// Points
router.get('/balance', authenticate, LoyaltyController.getBalance);
router.get('/history', authenticate, LoyaltyController.getHistory);
router.post('/users/:userId/points', authenticate, authorize(['admin']), validate({ body: addPointsSchema }), LoyaltyController.addPoints);

// Rewards
router.get('/rewards', LoyaltyController.getRewards);
router.post('/rewards', authenticate, authorize(['admin']), validate({ body: createRewardSchema }), LoyaltyController.createReward);
router.post('/redeem', authenticate, validate({ body: redeemPointsSchema }), LoyaltyController.redeemReward);

// Referrals
router.post('/referrals', authenticate, validate({ body: createReferralSchema }), LoyaltyController.createReferral);
router.get('/referrals', authenticate, LoyaltyController.getReferrals);

export default router;

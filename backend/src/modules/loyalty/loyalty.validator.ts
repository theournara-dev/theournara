import { z } from 'zod';

export const addPointsSchema = z.object({
  points: z.number().int().refine((val) => val !== 0, {
    message: 'Points cannot be zero',
  }),
  description: z.string().optional(),
});

export const redeemPointsSchema = z.object({
  rewardId: z.string().uuid(),
});

export const createRewardSchema = z.object({
  title: z.string().min(3).max(100),
  pointsCost: z.number().int().positive(),
  description: z.string().optional(),
});

export const createReferralSchema = z.object({
  refereeEmail: z.string().email(),
});

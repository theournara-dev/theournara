import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const voteReviewSchema = z.object({
  vote: z.number().int().refine((val) => val === 1 || val === -1, {
    message: 'Vote must be 1 (upvote) or -1 (downvote)',
  }),
});

export const createQuestionSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(5).max(255),
});

export const createAnswerSchema = z.object({
  content: z.string().min(5).max(1000),
});

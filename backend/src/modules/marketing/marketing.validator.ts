import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  discountType: z.enum(['percentage', 'amount']),
  discountValue: z.number().positive(),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().int().positive().optional(),
  minOrderValue: z.number().positive().optional(),
});

export const updateCouponSchema = z.object({
  discountType: z.enum(['percentage', 'amount']).optional(),
  discountValue: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().int().positive().optional(),
  minOrderValue: z.number().positive().optional(),
});

export const createOfferSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  discountPercentage: z.number().positive().max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  productIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const createFlashSaleSchema = z.object({
  title: z.string().min(3).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  discountPercentage: z.number().positive().max(100),
  products: z.array(
    z.object({
      productId: z.string().uuid(),
      discountPrice: z.number().positive(),
      stockLimit: z.number().int().positive(),
    })
  ),
});

// src/modules/products/products.validator.ts
import { z } from 'zod';

export const queryProductSchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  category: z.string().optional(), // category slug
  brand: z.string().optional(), // brand name or id
  minPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  maxPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  sortBy: z.enum(['price-asc', 'price-desc', 'newest', 'popular']).optional().default('newest'),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  brandId: z.string().uuid('Invalid brand ID'),
  categoryIds: z.array(z.string().uuid()).min(1, 'At least one category ID is required'),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'Variant SKU is required'),
    additionalPrice: z.number().default(0),
    stock: z.number().int().nonnegative().default(0)
  })).optional(),
  images: z.array(z.object({
    url: z.string().min(1, 'Image URL is required'),
    altText: z.string().optional()
  })).optional(),
  videos: z.array(z.object({
    url: z.string().min(1, 'Video URL is required'),
    thumbnail: z.string().optional()
  })).optional()
});

export const updateProductSchema = createProductSchema.partial();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.queryProductSchema = void 0;
// src/modules/products/products.validator.ts
const zod_1 = require("zod");
exports.queryProductSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(v => v ? parseInt(v) : 1),
    limit: zod_1.z.string().optional().transform(v => v ? parseInt(v) : 10),
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(), // category slug
    brand: zod_1.z.string().optional(), // brand name or id
    minPrice: zod_1.z.string().optional().transform(v => v ? parseFloat(v) : undefined),
    maxPrice: zod_1.z.string().optional().transform(v => v ? parseFloat(v) : undefined),
    sortBy: zod_1.z.enum(['price-asc', 'price-desc', 'newest', 'popular']).optional().default('newest'),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required'),
    slug: zod_1.z.string().min(1, 'Slug is required'),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive('Price must be greater than zero'),
    stock: zod_1.z.number().int().nonnegative('Stock cannot be negative'),
    brandId: zod_1.z.string().uuid('Invalid brand ID'),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one category ID is required'),
    variants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid().optional(),
        name: zod_1.z.string().min(1, 'Variant name is required'),
        sku: zod_1.z.string().min(1, 'Variant SKU is required'),
        additionalPrice: zod_1.z.number().default(0),
        stock: zod_1.z.number().int().nonnegative().default(0)
    })).optional(),
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().min(1, 'Image URL is required'),
        altText: zod_1.z.string().optional()
    })).optional(),
    videos: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().min(1, 'Video URL is required'),
        thumbnail: zod_1.z.string().optional()
    })).optional()
});
exports.updateProductSchema = exports.createProductSchema.partial();
//# sourceMappingURL=products.validator.js.map
// src/modules/products/products.routes.ts
import { Router } from 'express';
import { listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, listBrands } from './products.controller';
import { validate } from '../../middleware/validate';
import { queryProductSchema, createProductSchema, updateProductSchema } from './products.validator';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Public routes
router.get('/', validate({ query: queryProductSchema }), listProducts);
router.get('/brands', listBrands);
router.get('/slug/:slug', getProductBySlug);

// Admin-only routes
router.post('/', authenticate, authorize(['Admin']), validate({ body: createProductSchema }), createProduct);
router.put('/:id', authenticate, authorize(['Admin']), validate({ body: updateProductSchema }), updateProduct);
router.delete('/:id', authenticate, authorize(['Admin']), deleteProduct);

export default router;
export { router as productsRouter };

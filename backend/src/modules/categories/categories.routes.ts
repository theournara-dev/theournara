// src/modules/categories/categories.routes.ts
import { Router } from 'express';
import { listCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from './categories.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Public routes
router.get('/', listCategories);
router.get('/slug/:slug', getCategoryBySlug);

// Admin-only routes
router.post('/', authenticate, authorize(['Admin']), createCategory);
router.put('/:id', authenticate, authorize(['Admin']), updateCategory);
router.delete('/:id', authenticate, authorize(['Admin']), deleteCategory);

export default router;
export { router as categoriesRouter };

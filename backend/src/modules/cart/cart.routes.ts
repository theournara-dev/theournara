// src/modules/cart/cart.routes.ts
import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, syncCart } from './cart.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/sync', syncCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);

export default router;
export { router as cartRouter };

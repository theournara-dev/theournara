// src/modules/orders/orders.routes.ts
import { Router } from 'express';
import { placeOrder, getOrders, getOrderById, listAllOrders, updateOrderStatus, createRazorpayOrder, verifyRazorpayPayment } from './orders.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Payment routes
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Admin-only routes
router.get('/admin/all', authorize(['Admin']), listAllOrders);
router.put('/:id/status', authorize(['Admin']), updateOrderStatus);

export default router;
export { router as ordersRouter };

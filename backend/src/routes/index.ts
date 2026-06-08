import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import productsRoutes from '../modules/products/products.routes';
import categoriesRoutes from '../modules/categories/categories.routes';
import cartRoutes from '../modules/cart/cart.routes';
import wishlistRoutes from '../modules/wishlist/wishlist.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import addressesRoutes from '../modules/addresses/addresses.routes';
import marketingRoutes from '../modules/marketing/marketing.routes';
import reviewsRoutes from '../modules/reviews/reviews.routes';
import skinQuizRoutes from '../modules/skinQuiz/skinQuiz.routes';
import loyaltyRoutes from '../modules/loyalty/loyalty.routes';
import mediaRoutes from '../modules/media/media.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

const router = Router();

// API Healthcheck
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', ordersRoutes);
router.use('/addresses', addressesRoutes);
router.use('/marketing', marketingRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/skin-quiz', skinQuizRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/media', mediaRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

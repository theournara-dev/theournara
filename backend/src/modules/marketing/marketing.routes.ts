import { Router } from 'express';
import { MarketingController } from './marketing.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createCouponSchema,
  updateCouponSchema,
  createOfferSchema,
  createFlashSaleSchema,
} from './marketing.validator';

const router = Router();

// Coupons
router.get('/coupons', authenticate, authorize(['admin', 'manager']), MarketingController.getCoupons);
router.post('/coupons', authenticate, authorize(['admin', 'manager']), validate({ body: createCouponSchema }), MarketingController.createCoupon);
router.get('/coupons/:code', authenticate, MarketingController.getCouponByCode);
router.patch('/coupons/:id', authenticate, authorize(['admin', 'manager']), validate({ body: updateCouponSchema }), MarketingController.updateCoupon);
router.delete('/coupons/:id', authenticate, authorize(['admin', 'manager']), MarketingController.deleteCoupon);

// Offers
router.get('/offers', authenticate, authorize(['admin', 'manager']), MarketingController.getOffers);
router.post('/offers', authenticate, authorize(['admin', 'manager']), validate({ body: createOfferSchema }), MarketingController.createOffer);
router.get('/offers/active', MarketingController.getActiveOffers);

// Flash Sales
router.get('/flash-sales', authenticate, authorize(['admin', 'manager']), MarketingController.getFlashSales);
router.post('/flash-sales', authenticate, authorize(['admin', 'manager']), validate({ body: createFlashSaleSchema }), MarketingController.createFlashSale);
router.get('/flash-sales/active', MarketingController.getActiveFlashSales);

export default router;

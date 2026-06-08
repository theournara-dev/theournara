"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketing_controller_1 = require("./marketing.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const validate_1 = require("../../middleware/validate");
const marketing_validator_1 = require("./marketing.validator");
const router = (0, express_1.Router)();
// Coupons
router.get('/coupons', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), marketing_controller_1.MarketingController.getCoupons);
router.post('/coupons', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), (0, validate_1.validate)({ body: marketing_validator_1.createCouponSchema }), marketing_controller_1.MarketingController.createCoupon);
router.get('/coupons/:code', authenticate_1.authenticate, marketing_controller_1.MarketingController.getCouponByCode);
router.patch('/coupons/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), (0, validate_1.validate)({ body: marketing_validator_1.updateCouponSchema }), marketing_controller_1.MarketingController.updateCoupon);
router.delete('/coupons/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), marketing_controller_1.MarketingController.deleteCoupon);
// Offers
router.get('/offers', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), marketing_controller_1.MarketingController.getOffers);
router.post('/offers', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), (0, validate_1.validate)({ body: marketing_validator_1.createOfferSchema }), marketing_controller_1.MarketingController.createOffer);
router.get('/offers/active', marketing_controller_1.MarketingController.getActiveOffers);
// Flash Sales
router.get('/flash-sales', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), marketing_controller_1.MarketingController.getFlashSales);
router.post('/flash-sales', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), (0, validate_1.validate)({ body: marketing_validator_1.createFlashSaleSchema }), marketing_controller_1.MarketingController.createFlashSale);
router.get('/flash-sales/active', marketing_controller_1.MarketingController.getActiveFlashSales);
exports.default = router;
//# sourceMappingURL=marketing.routes.js.map
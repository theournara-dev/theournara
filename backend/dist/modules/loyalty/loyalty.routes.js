"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loyalty_controller_1 = require("./loyalty.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const validate_1 = require("../../middleware/validate");
const loyalty_validator_1 = require("./loyalty.validator");
const router = (0, express_1.Router)();
// Points
router.get('/balance', authenticate_1.authenticate, loyalty_controller_1.LoyaltyController.getBalance);
router.get('/history', authenticate_1.authenticate, loyalty_controller_1.LoyaltyController.getHistory);
router.post('/users/:userId/points', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin']), (0, validate_1.validate)({ body: loyalty_validator_1.addPointsSchema }), loyalty_controller_1.LoyaltyController.addPoints);
// Rewards
router.get('/rewards', loyalty_controller_1.LoyaltyController.getRewards);
router.post('/rewards', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin']), (0, validate_1.validate)({ body: loyalty_validator_1.createRewardSchema }), loyalty_controller_1.LoyaltyController.createReward);
router.post('/redeem', authenticate_1.authenticate, (0, validate_1.validate)({ body: loyalty_validator_1.redeemPointsSchema }), loyalty_controller_1.LoyaltyController.redeemReward);
// Referrals
router.post('/referrals', authenticate_1.authenticate, (0, validate_1.validate)({ body: loyalty_validator_1.createReferralSchema }), loyalty_controller_1.LoyaltyController.createReferral);
router.get('/referrals', authenticate_1.authenticate, loyalty_controller_1.LoyaltyController.getReferrals);
exports.default = router;
//# sourceMappingURL=loyalty.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyController = void 0;
const loyalty_service_1 = require("./loyalty.service");
const response_1 = require("../../utils/response");
class LoyaltyController {
    static async getBalance(req, res, next) {
        try {
            const userId = req.user.id;
            const balance = await loyalty_service_1.LoyaltyService.getUserBalance(userId);
            (0, response_1.sendSuccess)(res, { balance }, 'Loyalty balance fetched');
        }
        catch (error) {
            next(error);
        }
    }
    static async getHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const history = await loyalty_service_1.LoyaltyService.getTransactionHistory(userId);
            (0, response_1.sendSuccess)(res, history, 'Transaction history fetched');
        }
        catch (error) {
            next(error);
        }
    }
    static async addPoints(req, res, next) {
        try {
            const { userId } = req.params; // Admin adding points to a user
            const { points, description } = req.body;
            const transaction = await loyalty_service_1.LoyaltyService.addTransaction(userId, points, description);
            (0, response_1.sendSuccess)(res, transaction, 'Points added successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getRewards(req, res, next) {
        try {
            const rewards = await loyalty_service_1.LoyaltyService.getRewards();
            (0, response_1.sendSuccess)(res, rewards, 'Rewards fetched');
        }
        catch (error) {
            next(error);
        }
    }
    static async createReward(req, res, next) {
        try {
            const reward = await loyalty_service_1.LoyaltyService.createReward(req.body);
            (0, response_1.sendSuccess)(res, reward, 'Reward created', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async redeemReward(req, res, next) {
        try {
            const userId = req.user.id;
            const { rewardId } = req.body;
            const result = await loyalty_service_1.LoyaltyService.redeemReward(userId, rewardId);
            (0, response_1.sendSuccess)(res, result, 'Reward redeemed successfully');
        }
        catch (error) {
            if (error.message === 'Insufficient points' || error.message === 'Reward not found') {
                return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
            }
            next(error);
        }
    }
    static async createReferral(req, res, next) {
        try {
            const userId = req.user.id;
            const { refereeEmail } = req.body;
            const referral = await loyalty_service_1.LoyaltyService.createReferral(userId, refereeEmail);
            (0, response_1.sendSuccess)(res, referral, 'Referral created', 201);
        }
        catch (error) {
            if (error.message === 'User with this email already exists') {
                return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
            }
            next(error);
        }
    }
    static async getReferrals(req, res, next) {
        try {
            const userId = req.user.id;
            const referrals = await loyalty_service_1.LoyaltyService.getUserReferrals(userId);
            (0, response_1.sendSuccess)(res, referrals, 'Referrals fetched');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LoyaltyController = LoyaltyController;
//# sourceMappingURL=loyalty.controller.js.map
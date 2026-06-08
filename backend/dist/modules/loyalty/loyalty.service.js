"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class LoyaltyService {
    // === POINTS ===
    static async addTransaction(userId, points, description) {
        return client_1.default.loyaltyTransaction.create({
            data: {
                userId,
                points,
                description,
            },
        });
    }
    static async getUserBalance(userId) {
        const transactions = await client_1.default.loyaltyTransaction.findMany({
            where: { userId },
        });
        return transactions.reduce((total, t) => total + t.points, 0);
    }
    static async getTransactionHistory(userId) {
        return client_1.default.loyaltyTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    // === REWARDS ===
    static async createReward(data) {
        return client_1.default.reward.create({ data });
    }
    static async getRewards() {
        return client_1.default.reward.findMany({
            orderBy: { pointsCost: 'asc' },
        });
    }
    static async redeemReward(userId, rewardId) {
        const reward = await client_1.default.reward.findUnique({ where: { id: rewardId } });
        if (!reward)
            throw new Error('Reward not found');
        const balance = await this.getUserBalance(userId);
        if (balance < reward.pointsCost)
            throw new Error('Insufficient points');
        return client_1.default.$transaction(async (tx) => {
            // Deduct points
            const transaction = await tx.loyaltyTransaction.create({
                data: {
                    userId,
                    points: -reward.pointsCost,
                    description: `Redeemed reward: ${reward.title}`,
                },
            });
            // In a real system, generate a coupon or trigger fulfillment here
            return { transaction, reward };
        });
    }
    // === REFERRALS ===
    static async createReferral(referrerId, refereeEmail) {
        const existingUser = await client_1.default.user.findUnique({ where: { email: refereeEmail } });
        if (existingUser)
            throw new Error('User with this email already exists');
        return client_1.default.referral.create({
            data: {
                referrerId,
                refereeEmail,
                status: 'pending',
            },
        });
    }
    static async completeReferral(refereeEmail) {
        const referral = await client_1.default.referral.findFirst({
            where: { refereeEmail, status: 'pending' },
        });
        if (referral) {
            await client_1.default.$transaction([
                client_1.default.referral.update({
                    where: { id: referral.id },
                    data: { status: 'completed' },
                }),
                client_1.default.loyaltyTransaction.create({
                    data: {
                        userId: referral.referrerId,
                        points: 500, // example referral bonus
                        description: `Referral bonus for ${refereeEmail}`,
                    },
                }),
            ]);
        }
    }
    static async getUserReferrals(userId) {
        return client_1.default.referral.findMany({
            where: { referrerId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.LoyaltyService = LoyaltyService;
//# sourceMappingURL=loyalty.service.js.map
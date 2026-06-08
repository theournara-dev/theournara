import prisma from '../../prisma/client';

export class LoyaltyService {
  // === POINTS ===
  static async addTransaction(userId: string, points: number, description?: string) {
    return prisma.loyaltyTransaction.create({
      data: {
        userId,
        points,
        description,
      },
    });
  }

  static async getUserBalance(userId: string) {
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId },
    });
    return transactions.reduce((total, t) => total + t.points, 0);
  }

  static async getTransactionHistory(userId: string) {
    return prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // === REWARDS ===
  static async createReward(data: { title: string; pointsCost: number; description?: string }) {
    return prisma.reward.create({ data });
  }

  static async getRewards() {
    return prisma.reward.findMany({
      orderBy: { pointsCost: 'asc' },
    });
  }

  static async redeemReward(userId: string, rewardId: string) {
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new Error('Reward not found');

    const balance = await this.getUserBalance(userId);
    if (balance < reward.pointsCost) throw new Error('Insufficient points');

    return prisma.$transaction(async (tx) => {
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
  static async createReferral(referrerId: string, refereeEmail: string) {
    const existingUser = await prisma.user.findUnique({ where: { email: refereeEmail } });
    if (existingUser) throw new Error('User with this email already exists');

    return prisma.referral.create({
      data: {
        referrerId,
        refereeEmail,
        status: 'pending',
      },
    });
  }

  static async completeReferral(refereeEmail: string) {
    const referral = await prisma.referral.findFirst({
      where: { refereeEmail, status: 'pending' },
    });
    
    if (referral) {
      await prisma.$transaction([
        prisma.referral.update({
          where: { id: referral.id },
          data: { status: 'completed' },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            userId: referral.referrerId,
            points: 500, // example referral bonus
            description: `Referral bonus for ${refereeEmail}`,
          },
        }),
      ]);
    }
  }

  static async getUserReferrals(userId: string) {
    return prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import prisma from '../../prisma/client';

export class MarketingService {
  // === COUPONS ===
  static async createCoupon(data: any) {
    return prisma.coupon.create({ data });
  }

  static async getCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCouponByCode(code: string) {
    return prisma.coupon.findUnique({ where: { code } });
  }

  static async updateCoupon(id: string, data: any) {
    return prisma.coupon.update({
      where: { id },
      data,
    });
  }

  static async deleteCoupon(id: string) {
    return prisma.coupon.delete({ where: { id } });
  }

  // === OFFERS ===
  static async createOffer(data: {
    title: string;
    description?: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    productIds?: string[];
    categoryIds?: string[];
  }) {
    const { productIds, categoryIds, ...offerData } = data;
    
    return prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: offerData,
      });

      if (productIds && productIds.length > 0) {
        await tx.offerProduct.createMany({
          data: productIds.map((productId) => ({
            offerId: offer.id,
            productId,
          })),
        });
      }

      if (categoryIds && categoryIds.length > 0) {
        await tx.offerCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            offerId: offer.id,
            categoryId,
          })),
        });
      }

      return offer;
    });
  }

  static async getOffers() {
    return prisma.offer.findMany({
      include: {
        products: { include: { product: true } },
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getActiveOffers() {
    const now = new Date();
    return prisma.offer.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: true,
        categories: true,
      },
    });
  }

  // === FLASH SALES ===
  static async createFlashSale(data: {
    title: string;
    startDate: string;
    endDate: string;
    discountPercentage: number;
    products: { productId: string; discountPrice: number; stockLimit: number }[];
  }) {
    const { products, ...flashSaleData } = data;
    
    return prisma.$transaction(async (tx) => {
      const flashSale = await tx.flashSale.create({
        data: flashSaleData,
      });

      if (products && products.length > 0) {
        await tx.flashSaleProduct.createMany({
          data: products.map((p) => ({
            flashSaleId: flashSale.id,
            productId: p.productId,
            discountPrice: p.discountPrice,
            stockLimit: p.stockLimit,
          })),
        });
      }

      return flashSale;
    });
  }

  static async getFlashSales() {
    return prisma.flashSale.findMany({
      include: {
        products: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getActiveFlashSales() {
    const now = new Date();
    return prisma.flashSale.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: {
          include: { product: true }
        },
      },
    });
  }
}

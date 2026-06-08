"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class MarketingService {
    // === COUPONS ===
    static async createCoupon(data) {
        return client_1.default.coupon.create({ data });
    }
    static async getCoupons() {
        return client_1.default.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getCouponByCode(code) {
        return client_1.default.coupon.findUnique({ where: { code } });
    }
    static async updateCoupon(id, data) {
        return client_1.default.coupon.update({
            where: { id },
            data,
        });
    }
    static async deleteCoupon(id) {
        return client_1.default.coupon.delete({ where: { id } });
    }
    // === OFFERS ===
    static async createOffer(data) {
        const { productIds, categoryIds, ...offerData } = data;
        return client_1.default.$transaction(async (tx) => {
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
        return client_1.default.offer.findMany({
            include: {
                products: { include: { product: true } },
                categories: { include: { category: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getActiveOffers() {
        const now = new Date();
        return client_1.default.offer.findMany({
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
    static async createFlashSale(data) {
        const { products, ...flashSaleData } = data;
        return client_1.default.$transaction(async (tx) => {
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
        return client_1.default.flashSale.findMany({
            include: {
                products: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getActiveFlashSales() {
        const now = new Date();
        return client_1.default.flashSale.findMany({
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
exports.MarketingService = MarketingService;
//# sourceMappingURL=marketing.service.js.map
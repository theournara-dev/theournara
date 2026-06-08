"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingController = void 0;
const marketing_service_1 = require("./marketing.service");
const response_1 = require("../../utils/response");
class MarketingController {
    // === COUPONS ===
    static async createCoupon(req, res, next) {
        try {
            const coupon = await marketing_service_1.MarketingService.createCoupon(req.body);
            (0, response_1.sendSuccess)(res, coupon, 'Coupon created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCoupons(req, res, next) {
        try {
            const coupons = await marketing_service_1.MarketingService.getCoupons();
            (0, response_1.sendSuccess)(res, coupons, 'Coupons fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getCouponByCode(req, res, next) {
        try {
            const { code } = req.params;
            const coupon = await marketing_service_1.MarketingService.getCouponByCode(code);
            if (!coupon) {
                return (0, response_1.sendError)(res, [{ message: 'Coupon not found' }], 'Coupon not found', 404);
            }
            (0, response_1.sendSuccess)(res, coupon, 'Coupon fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCoupon(req, res, next) {
        try {
            const { id } = req.params;
            const coupon = await marketing_service_1.MarketingService.updateCoupon(id, req.body);
            (0, response_1.sendSuccess)(res, coupon, 'Coupon updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCoupon(req, res, next) {
        try {
            const { id } = req.params;
            await marketing_service_1.MarketingService.deleteCoupon(id);
            (0, response_1.sendSuccess)(res, {}, 'Coupon deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    // === OFFERS ===
    static async createOffer(req, res, next) {
        try {
            const offer = await marketing_service_1.MarketingService.createOffer(req.body);
            (0, response_1.sendSuccess)(res, offer, 'Offer created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOffers(req, res, next) {
        try {
            const offers = await marketing_service_1.MarketingService.getOffers();
            (0, response_1.sendSuccess)(res, offers, 'Offers fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getActiveOffers(req, res, next) {
        try {
            const offers = await marketing_service_1.MarketingService.getActiveOffers();
            (0, response_1.sendSuccess)(res, offers, 'Active offers fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    // === FLASH SALES ===
    static async createFlashSale(req, res, next) {
        try {
            const flashSale = await marketing_service_1.MarketingService.createFlashSale(req.body);
            (0, response_1.sendSuccess)(res, flashSale, 'Flash sale created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getFlashSales(req, res, next) {
        try {
            const flashSales = await marketing_service_1.MarketingService.getFlashSales();
            (0, response_1.sendSuccess)(res, flashSales, 'Flash sales fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getActiveFlashSales(req, res, next) {
        try {
            const flashSales = await marketing_service_1.MarketingService.getActiveFlashSales();
            (0, response_1.sendSuccess)(res, flashSales, 'Active flash sales fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MarketingController = MarketingController;
//# sourceMappingURL=marketing.controller.js.map
import { Request, Response, NextFunction } from 'express';
import { MarketingService } from './marketing.service';
import { sendSuccess, sendError } from '../../utils/response';

export class MarketingController {
  // === COUPONS ===
  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await MarketingService.createCoupon(req.body);
      sendSuccess(res, coupon, 'Coupon created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await MarketingService.getCoupons();
      sendSuccess(res, coupons, 'Coupons fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCouponByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const coupon = await MarketingService.getCouponByCode(code);
      if (!coupon) {
        return sendError(res, [{ message: 'Coupon not found' }], 'Coupon not found', 404);
      }
      sendSuccess(res, coupon, 'Coupon fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await MarketingService.updateCoupon(id, req.body);
      sendSuccess(res, coupon, 'Coupon updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await MarketingService.deleteCoupon(id);
      sendSuccess(res, {}, 'Coupon deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // === OFFERS ===
  static async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await MarketingService.createOffer(req.body);
      sendSuccess(res, offer, 'Offer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await MarketingService.getOffers();
      sendSuccess(res, offers, 'Offers fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getActiveOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await MarketingService.getActiveOffers();
      sendSuccess(res, offers, 'Active offers fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // === FLASH SALES ===
  static async createFlashSale(req: Request, res: Response, next: NextFunction) {
    try {
      const flashSale = await MarketingService.createFlashSale(req.body);
      sendSuccess(res, flashSale, 'Flash sale created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFlashSales(req: Request, res: Response, next: NextFunction) {
    try {
      const flashSales = await MarketingService.getFlashSales();
      sendSuccess(res, flashSales, 'Flash sales fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getActiveFlashSales(req: Request, res: Response, next: NextFunction) {
    try {
      const flashSales = await MarketingService.getActiveFlashSales();
      sendSuccess(res, flashSales, 'Active flash sales fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

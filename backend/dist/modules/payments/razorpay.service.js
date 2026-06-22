"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayService = void 0;
// src/modules/payments/razorpay.service.ts
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../../config"));
class RazorpayService {
    razorpay;
    constructor() {
        // Only initialize if keys are present (lazy initialization like Resend)
        if (config_1.default.razorpayKeyId && config_1.default.razorpayKeySecret && !config_1.default.razorpayKeyId.startsWith('rzp_test_YOUR_KEY')) {
            this.razorpay = new razorpay_1.default({
                key_id: config_1.default.razorpayKeyId,
                key_secret: config_1.default.razorpayKeySecret,
            });
        }
        else {
            console.warn('[RazorpayService] Razorpay keys not configured. Payment creation will fail.');
        }
    }
    /**
     * Create a new order in Razorpay
     * @param amount Amount in INR (not paise, we convert it here)
     * @param receipt Receipt ID (usually the internal Order ID)
     */
    async createOrder(amount, receipt) {
        if (!this.razorpay) {
            throw new Error('Razorpay is not configured on the server.');
        }
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: receipt,
        };
        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        }
        catch (error) {
            console.error('[RazorpayService] Error creating order:', error);
            throw new Error('Failed to create Razorpay order');
        }
    }
    /**
     * Verify the payment signature sent by Razorpay on the frontend
     */
    verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature) {
        if (!config_1.default.razorpayKeySecret)
            return false;
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', config_1.default.razorpayKeySecret)
            .update(body.toString())
            .digest('hex');
        return expectedSignature === signature;
    }
}
exports.razorpayService = new RazorpayService();
//# sourceMappingURL=razorpay.service.js.map
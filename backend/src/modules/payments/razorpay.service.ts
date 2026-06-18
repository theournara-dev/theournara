// src/modules/payments/razorpay.service.ts
import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../../config';

class RazorpayService {
  private razorpay: any;

  constructor() {
    // Only initialize if keys are present (lazy initialization like Resend)
    if (config.razorpayKeyId && config.razorpayKeySecret && !config.razorpayKeyId.startsWith('rzp_test_YOUR_KEY')) {
      this.razorpay = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
      });
    } else {
      console.warn('[RazorpayService] Razorpay keys not configured. Payment creation will fail.');
    }
  }

  /**
   * Create a new order in Razorpay
   * @param amount Amount in INR (not paise, we convert it here)
   * @param receipt Receipt ID (usually the internal Order ID)
   */
  async createOrder(amount: number, receipt: string) {
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
    } catch (error) {
      console.error('[RazorpayService] Error creating order:', error);
      throw new Error('Failed to create Razorpay order');
    }
  }

  /**
   * Verify the payment signature sent by Razorpay on the frontend
   */
  verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    if (!config.razorpayKeySecret) return false;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}

export const razorpayService = new RazorpayService();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = placeOrder;
exports.getOrders = getOrders;
exports.getOrderById = getOrderById;
exports.listAllOrders = listAllOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.createRazorpayOrder = createRazorpayOrder;
exports.verifyRazorpayPayment = verifyRazorpayPayment;
const client_1 = __importDefault(require("../../prisma/client"));
const response_1 = require("../../utils/response");
const razorpay_service_1 = require("../payments/razorpay.service");
async function placeOrder(req, res, next) {
    try {
        const userId = req.user.id;
        const { shippingAddressId, paymentMethod, couponCode } = req.body;
        if (!shippingAddressId || !paymentMethod) {
            return (0, response_1.sendError)(res, [{ message: 'shippingAddressId and paymentMethod are required' }], 'Validation failed', 400);
        }
        // 1. Fetch Cart
        const cart = await client_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { isDeleted: false },
                    include: { variant: { include: { product: true } } }
                }
            }
        });
        if (!cart || cart.items.length === 0) {
            return (0, response_1.sendError)(res, [{ message: 'Your cart is empty' }], 'Cart is empty', 400);
        }
        // 2. Verify address belongs to user
        const address = await client_1.default.address.findUnique({ where: { id: shippingAddressId } });
        if (!address || address.userId !== userId || address.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Invalid shipping address' }], 'Invalid address', 400);
        }
        // 3. Calculate Cart Amount
        let subtotal = 0;
        for (const item of cart.items) {
            const price = Number(item.variant.product.price) + Number(item.variant.additionalPrice);
            subtotal += price * item.quantity;
        }
        // 4. Validate Coupon (if provided)
        let coupon = null;
        let discount = 0;
        if (couponCode) {
            coupon = await client_1.default.coupon.findUnique({ where: { code: couponCode, isDeleted: false } });
            if (!coupon) {
                return (0, response_1.sendError)(res, [{ message: 'Invalid coupon code' }], 'Invalid coupon', 400);
            }
            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
                return (0, response_1.sendError)(res, [{ message: 'Coupon has expired' }], 'Coupon expired', 400);
            }
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return (0, response_1.sendError)(res, [{ message: 'Coupon usage limit reached' }], 'Coupon fully used', 400);
            }
            if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
                return (0, response_1.sendError)(res, [{ message: `Minimum order value for this coupon is $${coupon.minOrderValue}` }], 'Minimum amount not met', 400);
            }
            if (coupon.discountType === 'percentage') {
                discount = (subtotal * Number(coupon.discountValue)) / 100;
            }
            else {
                discount = Number(coupon.discountValue);
            }
        }
        const totalAmount = Math.max(0, subtotal - discount);
        // 5. Place order inside a database transaction to ensure consistency
        const order = await client_1.default.$transaction(async (tx) => {
            // a. Verify and deduct stock for each item
            for (const item of cart.items) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId }
                });
                if (!variant || variant.stock < item.quantity) {
                    throw new Error(`Variant ${item.variant.sku} is out of stock. Available: ${variant?.stock || 0}`);
                }
                // Deduct variant stock
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } }
                });
                // Deduct general product stock
                await tx.product.update({
                    where: { id: item.variant.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
            // b. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    status: 'pending',
                    totalAmount,
                    currency: 'USD',
                    paymentMethod,
                    shippingAddressId,
                    couponId: coupon ? coupon.id : null,
                    items: {
                        create: cart.items.map(item => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: Number(item.variant.product.price) + Number(item.variant.additionalPrice)
                        }))
                    }
                },
                include: { items: true }
            });
            // c. Increment coupon used count
            if (coupon) {
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { increment: 1 } }
                });
            }
            // d. Clear Cart items
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
            // e. Add Loyalty Points (e.g. 1 point for every whole dollar spent)
            const pointsEarned = Math.floor(totalAmount);
            if (pointsEarned > 0) {
                await tx.loyaltyTransaction.create({
                    data: {
                        userId,
                        points: pointsEarned,
                        description: `Earned from Order #${newOrder.id.slice(0, 8)}`,
                    }
                });
            }
            return newOrder;
        });
        return (0, response_1.sendSuccess)(res, order, 'Order placed successfully', 211);
    }
    catch (error) {
        if (error.message.includes('out of stock')) {
            return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
        }
        next(error);
    }
}
async function getOrders(req, res, next) {
    try {
        const userId = req.user.id;
        const orders = await client_1.default.order.findMany({
            where: { userId, isDeleted: false },
            include: {
                items: {
                    include: {
                        variant: { include: { product: true } }
                    }
                },
                shippingAddress: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return (0, response_1.sendSuccess)(res, orders, 'Orders retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function getOrderById(req, res, next) {
    try {
        const userId = req.user.id;
        const roles = req.user.roles;
        const { id } = req.params;
        const order = await client_1.default.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        variant: { include: { product: true } }
                    }
                },
                shippingAddress: true,
                coupon: true,
                user: { select: { email: true, firstName: true, lastName: true } }
            }
        });
        if (!order || order.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Order not found' }], 'Not found', 404);
        }
        // Auth check: Admin can view any order, User can only view their own
        if (order.userId !== userId && !roles.includes('Admin')) {
            return (0, response_1.sendError)(res, [{ message: 'Unauthorized access' }], 'Forbidden', 403);
        }
        return (0, response_1.sendSuccess)(res, order, 'Order details retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
// Admin only: List all orders
async function listAllOrders(req, res, next) {
    try {
        const orders = await client_1.default.order.findMany({
            where: { isDeleted: false },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
                shippingAddress: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return (0, response_1.sendSuccess)(res, orders, 'All orders retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
// Admin only: Update order status
async function updateOrderStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return (0, response_1.sendError)(res, [{ message: `Status must be one of: ${validStatuses.join(', ')}` }], 'Invalid status', 400);
        }
        const order = await client_1.default.order.findUnique({ where: { id } });
        if (!order || order.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Order not found' }], 'Not found', 404);
        }
        const updated = await client_1.default.order.update({
            where: { id },
            data: { status }
        });
        return (0, response_1.sendSuccess)(res, updated, 'Order status updated successfully');
    }
    catch (error) {
        next(error);
    }
}
async function createRazorpayOrder(req, res, next) {
    try {
        const { orderId } = req.body;
        const order = await client_1.default.order.findUnique({ where: { id: orderId } });
        if (!order)
            return (0, response_1.sendError)(res, [{ message: 'Order not found' }], 'Not found', 404);
        const rzpOrder = await razorpay_service_1.razorpayService.createOrder(Number(order.totalAmount), order.id);
        return (0, response_1.sendSuccess)(res, rzpOrder, 'Razorpay order created');
    }
    catch (error) {
        next(error);
    }
}
async function verifyRazorpayPayment(req, res, next) {
    try {
        const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        const isValid = razorpay_service_1.razorpayService.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
            return (0, response_1.sendError)(res, [{ message: 'Invalid payment signature' }], 'Payment verification failed', 400);
        }
        const updatedOrder = await client_1.default.order.update({
            where: { id: orderId },
            data: { status: 'paid' }
        });
        return (0, response_1.sendSuccess)(res, updatedOrder, 'Payment verified successfully');
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=orders.controller.js.map
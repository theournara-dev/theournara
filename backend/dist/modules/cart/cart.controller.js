"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.removeCartItem = removeCartItem;
exports.syncCart = syncCart;
const client_1 = __importDefault(require("../../prisma/client"));
const response_1 = require("../../utils/response");
async function getCart(req, res, next) {
    try {
        const userId = req.user.id;
        let cart = await client_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { isDeleted: false },
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: { images: true }
                                },
                                shades: true
                            }
                        }
                    }
                }
            }
        });
        if (!cart) {
            cart = await client_1.default.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: { include: { images: true } },
                                    shades: true
                                }
                            }
                        }
                    }
                }
            });
        }
        return (0, response_1.sendSuccess)(res, cart, 'Cart retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function addToCart(req, res, next) {
    try {
        const userId = req.user.id;
        const { variantId, quantity } = req.body;
        if (!variantId || !quantity || quantity <= 0) {
            return (0, response_1.sendError)(res, [{ message: 'Valid variantId and positive quantity are required' }], 'Validation failed', 400);
        }
        // Check stock
        const variant = await client_1.default.productVariant.findUnique({
            where: { id: variantId, isDeleted: false },
            include: { product: true }
        });
        if (!variant || variant.product.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Product variant not found' }], 'Not found', 404);
        }
        if (variant.stock < quantity) {
            return (0, response_1.sendError)(res, [{ message: `Insufficient stock. Only ${variant.stock} available.` }], 'Out of stock', 400);
        }
        // Get or create cart
        let cart = await client_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await client_1.default.cart.create({ data: { userId } });
        }
        // Check if item already exists in cart
        const existingItem = await client_1.default.cartItem.findFirst({
            where: {
                cartId: cart.id,
                variantId,
                isDeleted: false
            }
        });
        let cartItem;
        if (existingItem) {
            const newQty = existingItem.quantity + quantity;
            if (variant.stock < newQty) {
                return (0, response_1.sendError)(res, [{ message: `Cannot add more. Combined cart quantity exceeds stock limit of ${variant.stock}` }], 'Out of stock', 400);
            }
            cartItem = await client_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQty }
            });
        }
        else {
            cartItem = await client_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity
                }
            });
        }
        return (0, response_1.sendSuccess)(res, cartItem, 'Item added to cart successfully', 211);
    }
    catch (error) {
        next(error);
    }
}
async function updateCartItem(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params; // cartItem ID
        const { quantity } = req.body;
        if (quantity === undefined || quantity <= 0) {
            return (0, response_1.sendError)(res, [{ message: 'Positive quantity is required' }], 'Validation failed', 400);
        }
        const cartItem = await client_1.default.cartItem.findUnique({
            where: { id },
            include: {
                cart: true,
                variant: true
            }
        });
        if (!cartItem || cartItem.isDeleted || cartItem.cart.userId !== userId) {
            return (0, response_1.sendError)(res, [{ message: 'Cart item not found' }], 'Not found', 404);
        }
        if (cartItem.variant.stock < quantity) {
            return (0, response_1.sendError)(res, [{ message: `Insufficient stock. Only ${cartItem.variant.stock} available.` }], 'Out of stock', 400);
        }
        const updatedItem = await client_1.default.cartItem.update({
            where: { id },
            data: { quantity }
        });
        return (0, response_1.sendSuccess)(res, updatedItem, 'Cart item updated successfully');
    }
    catch (error) {
        next(error);
    }
}
async function removeCartItem(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params; // cartItem ID
        const cartItem = await client_1.default.cartItem.findUnique({
            where: { id },
            include: { cart: true }
        });
        if (!cartItem || cartItem.isDeleted || cartItem.cart.userId !== userId) {
            return (0, response_1.sendError)(res, [{ message: 'Cart item not found' }], 'Not found', 404);
        }
        // Hard delete or soft delete
        await client_1.default.cartItem.delete({
            where: { id }
        });
        return (0, response_1.sendSuccess)(res, {}, 'Item removed from cart successfully');
    }
    catch (error) {
        next(error);
    }
}
async function syncCart(req, res, next) {
    try {
        const userId = req.user.id;
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return (0, response_1.sendError)(res, [{ message: 'items array is required' }], 'Validation failed', 400);
        }
        // 1. Get or create cart
        let cart = await client_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await client_1.default.cart.create({ data: { userId } });
        }
        // 2. Clear and recreate cart items inside a transaction
        await client_1.default.$transaction(async (tx) => {
            // Clear old items
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
            // Insert new ones
            for (const item of items) {
                const { variantId, quantity } = item;
                if (!variantId || quantity <= 0)
                    continue;
                // Check stock
                const variant = await tx.productVariant.findUnique({
                    where: { id: variantId, isDeleted: false }
                });
                if (!variant)
                    continue;
                // Clip quantity to stock
                const finalQty = Math.min(variant.stock, quantity);
                if (finalQty <= 0)
                    continue;
                await tx.cartItem.create({
                    data: {
                        cartId: cart.id,
                        variantId,
                        quantity: finalQty
                    }
                });
            }
        });
        // 3. Return updated cart
        const updatedCart = await client_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { isDeleted: false },
                    include: {
                        variant: {
                            include: {
                                product: { include: { images: true } }
                            }
                        }
                    }
                }
            }
        });
        return (0, response_1.sendSuccess)(res, updatedCart, 'Cart synced successfully');
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=cart.controller.js.map
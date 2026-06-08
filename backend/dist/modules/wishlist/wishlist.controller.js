"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = getWishlist;
exports.addToWishlist = addToWishlist;
exports.removeFromWishlist = removeFromWishlist;
const client_1 = __importDefault(require("../../prisma/client"));
const response_1 = require("../../utils/response");
async function getWishlist(req, res, next) {
    try {
        const userId = req.user.id;
        let wishlist = await client_1.default.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { isDeleted: false },
                    include: {
                        product: {
                            include: { images: true, brand: true }
                        }
                    }
                }
            }
        });
        if (!wishlist) {
            wishlist = await client_1.default.wishlist.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: { include: { images: true, brand: true } }
                        }
                    }
                }
            });
        }
        return (0, response_1.sendSuccess)(res, wishlist, 'Wishlist retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function addToWishlist(req, res, next) {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId) {
            return (0, response_1.sendError)(res, [{ message: 'productId is required' }], 'Validation failed', 400);
        }
        // Verify product exists
        const product = await client_1.default.product.findUnique({ where: { id: productId } });
        if (!product || product.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Product not found' }], 'Not found', 404);
        }
        // Get or create wishlist
        let wishlist = await client_1.default.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await client_1.default.wishlist.create({ data: { userId } });
        }
        // Check if already in wishlist
        const existing = await client_1.default.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId,
                isDeleted: false
            }
        });
        if (existing) {
            return (0, response_1.sendSuccess)(res, existing, 'Product is already in wishlist');
        }
        const item = await client_1.default.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId
            }
        });
        return (0, response_1.sendSuccess)(res, item, 'Added to wishlist successfully', 211);
    }
    catch (error) {
        next(error);
    }
}
async function removeFromWishlist(req, res, next) {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const wishlist = await client_1.default.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            return (0, response_1.sendError)(res, [{ message: 'Wishlist not found' }], 'Not found', 404);
        }
        const item = await client_1.default.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId,
                isDeleted: false
            }
        });
        if (!item) {
            return (0, response_1.sendError)(res, [{ message: 'Product not found in wishlist' }], 'Not found', 404);
        }
        await client_1.default.wishlistItem.delete({ where: { id: item.id } });
        return (0, response_1.sendSuccess)(res, {}, 'Removed from wishlist successfully');
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=wishlist.controller.js.map
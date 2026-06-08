// src/modules/wishlist/wishlist.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import prisma from '../../prisma/client';
import { sendSuccess, sendError } from '../../utils/response';

export async function getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    let wishlist = await prisma.wishlist.findUnique({
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
      wishlist = await prisma.wishlist.create({
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

    return sendSuccess(res, wishlist, 'Wishlist retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, [{ message: 'productId is required' }], 'Validation failed', 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.isDeleted) {
      return sendError(res, [{ message: 'Product not found' }], 'Not found', 404);
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
        isDeleted: false
      }
    });

    if (existing) {
      return sendSuccess(res, existing, 'Product is already in wishlist');
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId
      }
    });

    return sendSuccess(res, item, 'Added to wishlist successfully', 211);
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      return sendError(res, [{ message: 'Wishlist not found' }], 'Not found', 404);
    }

    const item = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
        isDeleted: false
      }
    });

    if (!item) {
      return sendError(res, [{ message: 'Product not found in wishlist' }], 'Not found', 404);
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });

    return sendSuccess(res, {}, 'Removed from wishlist successfully');
  } catch (error) {
    next(error);
  }
}

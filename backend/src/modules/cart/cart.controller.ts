// src/modules/cart/cart.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import prisma from '../../prisma/client';
import { sendSuccess, sendError } from '../../utils/response';

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    let cart = await prisma.cart.findUnique({
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
      cart = await prisma.cart.create({
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

    return sendSuccess(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { variantId, quantity } = req.body;

    if (!variantId || !quantity || quantity <= 0) {
      return sendError(res, [{ message: 'Valid variantId and positive quantity are required' }], 'Validation failed', 400);
    }

    // Check stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId, isDeleted: false },
      include: { product: true }
    });

    if (!variant || variant.product.isDeleted) {
      return sendError(res, [{ message: 'Product variant not found' }], 'Not found', 404);
    }

    if (variant.stock < quantity) {
      return sendError(res, [{ message: `Insufficient stock. Only ${variant.stock} available.` }], 'Out of stock', 400);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
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
        return sendError(res, [{ message: `Cannot add more. Combined cart quantity exceeds stock limit of ${variant.stock}` }], 'Out of stock', 400);
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity
        }
      });
    }

    return sendSuccess(res, cartItem, 'Item added to cart successfully', 211);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params; // cartItem ID
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
      return sendError(res, [{ message: 'Positive quantity is required' }], 'Validation failed', 400);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        variant: true
      }
    });

    if (!cartItem || cartItem.isDeleted || cartItem.cart.userId !== userId) {
      return sendError(res, [{ message: 'Cart item not found' }], 'Not found', 404);
    }

    if (cartItem.variant.stock < quantity) {
      return sendError(res, [{ message: `Insufficient stock. Only ${cartItem.variant.stock} available.` }], 'Out of stock', 400);
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    return sendSuccess(res, updatedItem, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params; // cartItem ID

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true }
    });

    if (!cartItem || cartItem.isDeleted || cartItem.cart.userId !== userId) {
      return sendError(res, [{ message: 'Cart item not found' }], 'Not found', 404);
    }

    // Hard delete or soft delete
    await prisma.cartItem.delete({
      where: { id }
    });

    return sendSuccess(res, {}, 'Item removed from cart successfully');
  } catch (error) {
    next(error);
  }
}

export async function syncCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return sendError(res, [{ message: 'items array is required' }], 'Validation failed', 400);
    }

    // 1. Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // 2. Clear and recreate cart items inside a transaction
    await prisma.$transaction(async (tx) => {
      // Clear old items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      // Insert new ones
      for (const item of items) {
        const { variantId, quantity } = item;
        if (!variantId || quantity <= 0) continue;

        // Check stock
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId, isDeleted: false }
        });
        if (!variant) continue;

        // Clip quantity to stock
        const finalQty = Math.min(variant.stock, quantity);
        if (finalQty <= 0) continue;

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
    const updatedCart = await prisma.cart.findUnique({
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

    return sendSuccess(res, updatedCart, 'Cart synced successfully');
  } catch (error) {
    next(error);
  }
}


import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import prisma from '../../prisma/client';
import { sendSuccess, sendError } from '../../utils/response';

export async function getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: { userId, isDeleted: false },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return sendSuccess(res, addresses, 'Addresses retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { line1, line2, city, state, zipCode, country, isDefault } = req.body;

    const newAddress = await prisma.$transaction(async (tx) => {
      // If setting as default, unset other default addresses
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, isDeleted: false },
          data: { isDefault: false }
        });
      }

      // Check if user has no addresses, make this one default regardless
      const count = await tx.address.count({ where: { userId, isDeleted: false } });
      const shouldBeDefault = count === 0 ? true : !!isDefault;

      return tx.address.create({
        data: {
          userId,
          line1,
          line2,
          city,
          state,
          zipCode,
          country,
          isDefault: shouldBeDefault
        }
      });
    });

    return sendSuccess(res, newAddress, 'Address created successfully', 211);
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { line1, line2, city, state, zipCode, country, isDefault } = req.body;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId || address.isDeleted) {
      return sendError(res, [{ message: 'Address not found' }], 'Not found', 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isDefault && !address.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, isDeleted: false },
          data: { isDefault: false }
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          line1,
          line2,
          city,
          state,
          zipCode,
          country,
          isDefault: isDefault !== undefined ? !!isDefault : address.isDefault
        }
      });
    });

    return sendSuccess(res, updated, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId || address.isDeleted) {
      return sendError(res, [{ message: 'Address not found' }], 'Not found', 404);
    }

    // Soft delete
    await prisma.address.update({
      where: { id },
      data: { isDeleted: true }
    });

    // If we deleted the default address, set another active address as default if any exist
    if (address.isDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: 'desc' }
      });
      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return sendSuccess(res, {}, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
}

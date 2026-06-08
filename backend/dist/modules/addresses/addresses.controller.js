"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddresses = getAddresses;
exports.createAddress = createAddress;
exports.updateAddress = updateAddress;
exports.deleteAddress = deleteAddress;
const client_1 = __importDefault(require("../../prisma/client"));
const response_1 = require("../../utils/response");
async function getAddresses(req, res, next) {
    try {
        const userId = req.user.id;
        const addresses = await client_1.default.address.findMany({
            where: { userId, isDeleted: false },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        return (0, response_1.sendSuccess)(res, addresses, 'Addresses retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function createAddress(req, res, next) {
    try {
        const userId = req.user.id;
        const { line1, line2, city, state, zipCode, country, isDefault } = req.body;
        const newAddress = await client_1.default.$transaction(async (tx) => {
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
        return (0, response_1.sendSuccess)(res, newAddress, 'Address created successfully', 211);
    }
    catch (error) {
        next(error);
    }
}
async function updateAddress(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { line1, line2, city, state, zipCode, country, isDefault } = req.body;
        const address = await client_1.default.address.findUnique({ where: { id } });
        if (!address || address.userId !== userId || address.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Address not found' }], 'Not found', 404);
        }
        const updated = await client_1.default.$transaction(async (tx) => {
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
        return (0, response_1.sendSuccess)(res, updated, 'Address updated successfully');
    }
    catch (error) {
        next(error);
    }
}
async function deleteAddress(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const address = await client_1.default.address.findUnique({ where: { id } });
        if (!address || address.userId !== userId || address.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Address not found' }], 'Not found', 404);
        }
        // Soft delete
        await client_1.default.address.update({
            where: { id },
            data: { isDeleted: true }
        });
        // If we deleted the default address, set another active address as default if any exist
        if (address.isDefault) {
            const remainingAddress = await client_1.default.address.findFirst({
                where: { userId, isDeleted: false },
                orderBy: { createdAt: 'desc' }
            });
            if (remainingAddress) {
                await client_1.default.address.update({
                    where: { id: remainingAddress.id },
                    data: { isDefault: true }
                });
            }
        }
        return (0, response_1.sendSuccess)(res, {}, 'Address deleted successfully');
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=addresses.controller.js.map
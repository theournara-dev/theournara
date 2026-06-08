"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProductBySlug = getProductBySlug;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.listBrands = listBrands;
const products_service_1 = require("./products.service");
const response_1 = require("../../utils/response");
const client_1 = __importDefault(require("../../prisma/client"));
async function listProducts(req, res, next) {
    try {
        const filters = req.query;
        const result = await products_service_1.ProductsService.listProducts({
            page: filters.page,
            limit: filters.limit,
            search: filters.search,
            category: filters.category,
            brand: filters.brand,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            sortBy: filters.sortBy,
        });
        return (0, response_1.sendSuccess)(res, result, 'Products retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function getProductBySlug(req, res, next) {
    try {
        const { slug } = req.params;
        const product = await products_service_1.ProductsService.getProductBySlug(slug);
        return (0, response_1.sendSuccess)(res, product, 'Product details retrieved successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 404);
    }
}
async function createProduct(req, res, next) {
    try {
        const product = await products_service_1.ProductsService.createProduct(req.body);
        return (0, response_1.sendSuccess)(res, product, 'Product created successfully', 211);
    }
    catch (error) {
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
    }
}
async function updateProduct(req, res, next) {
    try {
        const { id } = req.params;
        const product = await products_service_1.ProductsService.updateProduct(id, req.body);
        return (0, response_1.sendSuccess)(res, product, 'Product updated successfully');
    }
    catch (error) {
        console.error('Update Product Error:', error);
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 400);
    }
}
async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;
        await products_service_1.ProductsService.deleteProduct(id);
        return (0, response_1.sendSuccess)(res, {}, 'Product deleted successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, [{ message: error.message }], error.message, 404);
    }
}
async function listBrands(req, res, next) {
    try {
        const brands = await client_1.default.brand.findMany({
            where: { isDeleted: false }
        });
        return (0, response_1.sendSuccess)(res, brands, 'Brands retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=products.controller.js.map
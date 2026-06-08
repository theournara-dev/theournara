"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
// src/modules/products/products.routes.ts
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const validate_1 = require("../../middleware/validate");
const products_validator_1 = require("./products.validator");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
exports.productsRouter = router;
// Public routes
router.get('/', (0, validate_1.validate)({ query: products_validator_1.queryProductSchema }), products_controller_1.listProducts);
router.get('/brands', products_controller_1.listBrands);
router.get('/slug/:slug', products_controller_1.getProductBySlug);
// Admin-only routes
router.post('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), (0, validate_1.validate)({ body: products_validator_1.createProductSchema }), products_controller_1.createProduct);
router.put('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), (0, validate_1.validate)({ body: products_validator_1.updateProductSchema }), products_controller_1.updateProduct);
router.delete('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), products_controller_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
// src/modules/categories/categories.routes.ts
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
exports.categoriesRouter = router;
// Public routes
router.get('/', categories_controller_1.listCategories);
router.get('/slug/:slug', categories_controller_1.getCategoryBySlug);
// Admin-only routes
router.post('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), categories_controller_1.createCategory);
router.put('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), categories_controller_1.updateCategory);
router.delete('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin']), categories_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map
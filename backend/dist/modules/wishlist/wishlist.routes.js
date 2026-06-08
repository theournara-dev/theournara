"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRouter = void 0;
// src/modules/wishlist/wishlist.routes.ts
const express_1 = require("express");
const wishlist_controller_1 = require("./wishlist.controller");
const authenticate_1 = require("../../middleware/authenticate");
const router = (0, express_1.Router)();
exports.wishlistRouter = router;
router.use(authenticate_1.authenticate);
router.get('/', wishlist_controller_1.getWishlist);
router.post('/', wishlist_controller_1.addToWishlist);
router.delete('/:productId', wishlist_controller_1.removeFromWishlist);
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map
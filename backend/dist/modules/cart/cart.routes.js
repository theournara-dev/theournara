"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
// src/modules/cart/cart.routes.ts
const express_1 = require("express");
const cart_controller_1 = require("./cart.controller");
const authenticate_1 = require("../../middleware/authenticate");
const router = (0, express_1.Router)();
exports.cartRouter = router;
router.use(authenticate_1.authenticate);
router.get('/', cart_controller_1.getCart);
router.post('/', cart_controller_1.addToCart);
router.post('/sync', cart_controller_1.syncCart);
router.put('/items/:id', cart_controller_1.updateCartItem);
router.delete('/items/:id', cart_controller_1.removeCartItem);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map
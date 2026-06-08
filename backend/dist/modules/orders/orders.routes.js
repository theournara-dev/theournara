"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
// src/modules/orders/orders.routes.ts
const express_1 = require("express");
const orders_controller_1 = require("./orders.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
exports.ordersRouter = router;
router.use(authenticate_1.authenticate);
// Customer routes
router.post('/', orders_controller_1.placeOrder);
router.get('/', orders_controller_1.getOrders);
router.get('/:id', orders_controller_1.getOrderById);
// Admin-only routes
router.get('/admin/all', (0, authorize_1.authorize)(['Admin']), orders_controller_1.listAllOrders);
router.put('/:id/status', (0, authorize_1.authorize)(['Admin']), orders_controller_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map
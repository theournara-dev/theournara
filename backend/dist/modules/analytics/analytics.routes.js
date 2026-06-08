"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.get('/dashboard', authenticate_1.authenticate, (0, authorize_1.authorize)(['admin', 'manager']), analytics_controller_1.AnalyticsController.getDashboardMetrics);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const response_1 = require("../../utils/response");
class AnalyticsController {
    static async getDashboardMetrics(req, res, next) {
        try {
            const metrics = await analytics_service_1.AnalyticsService.getDashboardMetrics();
            (0, response_1.sendSuccess)(res, metrics, 'Dashboard metrics fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map
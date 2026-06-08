"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const products_routes_1 = __importDefault(require("../modules/products/products.routes"));
const categories_routes_1 = __importDefault(require("../modules/categories/categories.routes"));
const cart_routes_1 = __importDefault(require("../modules/cart/cart.routes"));
const wishlist_routes_1 = __importDefault(require("../modules/wishlist/wishlist.routes"));
const orders_routes_1 = __importDefault(require("../modules/orders/orders.routes"));
const addresses_routes_1 = __importDefault(require("../modules/addresses/addresses.routes"));
const marketing_routes_1 = __importDefault(require("../modules/marketing/marketing.routes"));
const reviews_routes_1 = __importDefault(require("../modules/reviews/reviews.routes"));
const skinQuiz_routes_1 = __importDefault(require("../modules/skinQuiz/skinQuiz.routes"));
const loyalty_routes_1 = __importDefault(require("../modules/loyalty/loyalty.routes"));
const media_routes_1 = __importDefault(require("../modules/media/media.routes"));
const analytics_routes_1 = __importDefault(require("../modules/analytics/analytics.routes"));
const router = (0, express_1.Router)();
// API Healthcheck
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Mount modules
router.use('/auth', auth_routes_1.default);
router.use('/products', products_routes_1.default);
router.use('/categories', categories_routes_1.default);
router.use('/cart', cart_routes_1.default);
router.use('/wishlist', wishlist_routes_1.default);
router.use('/orders', orders_routes_1.default);
router.use('/addresses', addresses_routes_1.default);
router.use('/marketing', marketing_routes_1.default);
router.use('/reviews', reviews_routes_1.default);
router.use('/skin-quiz', skinQuiz_routes_1.default);
router.use('/loyalty', loyalty_routes_1.default);
router.use('/media', media_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressesRouter = void 0;
const express_1 = require("express");
const addresses_controller_1 = require("./addresses.controller");
const authenticate_1 = require("../../middleware/authenticate");
const validate_1 = require("../../middleware/validate");
const addresses_validator_1 = require("./addresses.validator");
const router = (0, express_1.Router)();
exports.addressesRouter = router;
router.use(authenticate_1.authenticate);
router.get('/', addresses_controller_1.getAddresses);
router.post('/', (0, validate_1.validate)({ body: addresses_validator_1.createAddressSchema }), addresses_controller_1.createAddress);
router.put('/:id', (0, validate_1.validate)({ body: addresses_validator_1.updateAddressSchema }), addresses_controller_1.updateAddress);
router.delete('/:id', addresses_controller_1.deleteAddress);
exports.default = router;
//# sourceMappingURL=addresses.routes.js.map
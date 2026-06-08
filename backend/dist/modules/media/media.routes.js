"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const media_controller_1 = require("./media.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
router.post('/upload', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin', 'Manager']), upload_1.upload.single('file'), media_controller_1.MediaController.uploadMedia);
router.get('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin', 'Manager']), media_controller_1.MediaController.getMediaList);
router.delete('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['Admin', 'Manager']), media_controller_1.MediaController.deleteMedia);
exports.default = router;
//# sourceMappingURL=media.routes.js.map
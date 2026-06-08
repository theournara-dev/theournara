"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skinQuiz_controller_1 = require("./skinQuiz.controller");
const authenticate_1 = require("../../middleware/authenticate");
const validate_1 = require("../../middleware/validate");
const skinQuiz_validator_1 = require("./skinQuiz.validator");
const router = (0, express_1.Router)();
router.get('/questions', skinQuiz_controller_1.SkinQuizController.getQuestions);
router.post('/submit', authenticate_1.authenticate, (0, validate_1.validate)({ body: skinQuiz_validator_1.submitQuizSchema }), skinQuiz_controller_1.SkinQuizController.submitResponses);
exports.default = router;
//# sourceMappingURL=skinQuiz.routes.js.map
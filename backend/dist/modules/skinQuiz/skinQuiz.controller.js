"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkinQuizController = void 0;
const skinQuiz_service_1 = require("./skinQuiz.service");
const response_1 = require("../../utils/response");
class SkinQuizController {
    static async getQuestions(req, res, next) {
        try {
            const questions = await skinQuiz_service_1.SkinQuizService.getQuestions();
            (0, response_1.sendSuccess)(res, questions, 'Quiz questions fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async submitResponses(req, res, next) {
        try {
            const userId = req.user.id;
            const { responses } = req.body;
            const result = await skinQuiz_service_1.SkinQuizService.submitResponses(userId, responses);
            (0, response_1.sendSuccess)(res, result, 'Quiz responses submitted and recommendations generated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SkinQuizController = SkinQuizController;
//# sourceMappingURL=skinQuiz.controller.js.map
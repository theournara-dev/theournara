"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkinQuizService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class SkinQuizService {
    static async getQuestions() {
        return client_1.default.skinQuizQuestion.findMany({
            include: {
                options: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    static async submitResponses(userId, responses) {
        // Delete existing responses for user
        await client_1.default.skinQuizResponse.deleteMany({
            where: { userId },
        });
        // Create new responses
        await client_1.default.skinQuizResponse.createMany({
            data: responses.map((r) => ({
                userId,
                questionId: r.questionId,
                selectedOptionId: r.optionId,
            })),
        });
        // Recommendation Engine Logic
        // For MVP: Get skin type and concerns based on options selected
        const selectedOptions = await client_1.default.skinQuizOption.findMany({
            where: { id: { in: responses.map((r) => r.optionId) } },
        });
        // Simple matching (e.g., recommend products tagged with these keywords)
        const values = selectedOptions.map((opt) => opt.value.toLowerCase());
        // Basic product recommendation based on description/name matching the quiz values
        const recommendedProducts = await client_1.default.product.findMany({
            where: {
                OR: values.map((val) => ({
                    description: { contains: val, mode: 'insensitive' },
                })),
            },
            take: 5,
        });
        return {
            responsesSaved: true,
            recommendations: recommendedProducts,
        };
    }
}
exports.SkinQuizService = SkinQuizService;
//# sourceMappingURL=skinQuiz.service.js.map
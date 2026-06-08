"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuizSchema = void 0;
const zod_1 = require("zod");
exports.submitQuizSchema = zod_1.z.object({
    responses: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string().uuid(),
        optionId: zod_1.z.string().uuid(),
    })),
});
//# sourceMappingURL=skinQuiz.validator.js.map
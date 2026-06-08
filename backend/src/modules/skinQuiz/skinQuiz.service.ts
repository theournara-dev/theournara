import prisma from '../../prisma/client';

export class SkinQuizService {
  static async getQuestions() {
    return prisma.skinQuizQuestion.findMany({
      include: {
        options: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async submitResponses(userId: string, responses: { questionId: string; optionId: string }[]) {
    // Delete existing responses for user
    await prisma.skinQuizResponse.deleteMany({
      where: { userId },
    });

    // Create new responses
    await prisma.skinQuizResponse.createMany({
      data: responses.map((r) => ({
        userId,
        questionId: r.questionId,
        selectedOptionId: r.optionId,
      })),
    });

    // Recommendation Engine Logic
    // For MVP: Get skin type and concerns based on options selected
    const selectedOptions = await prisma.skinQuizOption.findMany({
      where: { id: { in: responses.map((r) => r.optionId) } },
    });

    // Simple matching (e.g., recommend products tagged with these keywords)
    const values = selectedOptions.map((opt) => opt.value.toLowerCase());

    // Basic product recommendation based on description/name matching the quiz values
    const recommendedProducts = await prisma.product.findMany({
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

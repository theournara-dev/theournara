import prisma from '../../prisma/client';

export class ReviewsService {
  // === REVIEWS ===
  static async createReview(userId: string, data: { productId: string; rating: number; comment?: string }) {
    // Optional: check if user has bought the product
    return prisma.review.create({
      data: {
        userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }

  static async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async voteReview(userId: string, reviewId: string, vote: number) {
    return prisma.reviewVote.upsert({
      where: {
        reviewId_userId: { reviewId, userId },
      },
      update: { vote },
      create: { reviewId, userId, vote },
    });
  }

  static async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false) {
    if (isAdmin) {
      return prisma.review.delete({ where: { id: reviewId } });
    }
    
    // User can only delete their own review
    return prisma.review.delete({
      where: { id: reviewId, userId },
    });
  }

  // === QUESTIONS & ANSWERS ===
  static async createQuestion(userId: string, data: { productId: string; title: string }) {
    return prisma.question.create({
      data: {
        userId,
        productId: data.productId,
        title: data.title,
      },
    });
  }

  static async getProductQuestions(productId: string) {
    return prisma.question.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        answers: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createAnswer(userId: string, questionId: string, content: string) {
    return prisma.answer.create({
      data: {
        userId,
        questionId,
        content,
      },
    });
  }

  static async deleteQuestion(questionId: string, userId: string, isAdmin: boolean = false) {
    if (isAdmin) {
      return prisma.question.delete({ where: { id: questionId } });
    }
    return prisma.question.delete({
      where: { id: questionId, userId },
    });
  }

  static async deleteAnswer(answerId: string, userId: string, isAdmin: boolean = false) {
    if (isAdmin) {
      return prisma.answer.delete({ where: { id: answerId } });
    }
    return prisma.answer.delete({
      where: { id: answerId, userId },
    });
  }

  static async listAllReviews() {
    return prisma.review.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

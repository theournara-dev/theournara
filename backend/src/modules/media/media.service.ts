import prisma from '../../prisma/client';

export class MediaService {
  static async uploadMedia(data: { url: string; mimeType: string; size: number }) {
    // Note: Actual file upload to AWS/Cloudinary is mocked here
    return prisma.media.create({
      data,
    });
  }

  static async getMediaList() {
    return prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async deleteMedia(id: string) {
    return prisma.media.delete({ where: { id } });
  }
}

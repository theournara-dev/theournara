import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { sendSuccess, sendError } from '../../utils/response';

export class MediaController {
  static async uploadMedia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, [{ message: 'No file uploaded' }], 'Validation failed', 400);
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const media = await MediaService.uploadMedia({
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size
      });

      sendSuccess(res, media, 'Media uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMediaList(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await MediaService.getMediaList();
      sendSuccess(res, media, 'Media list fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await MediaService.deleteMedia(id);
      sendSuccess(res, {}, 'Media deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

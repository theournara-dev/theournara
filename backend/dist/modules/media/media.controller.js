"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const media_service_1 = require("./media.service");
const response_1 = require("../../utils/response");
class MediaController {
    static async uploadMedia(req, res, next) {
        try {
            if (!req.file) {
                return (0, response_1.sendError)(res, [{ message: 'No file uploaded' }], 'Validation failed', 400);
            }
            const fileUrl = `/uploads/${req.file.filename}`;
            const media = await media_service_1.MediaService.uploadMedia({
                url: fileUrl,
                mimeType: req.file.mimetype,
                size: req.file.size
            });
            (0, response_1.sendSuccess)(res, media, 'Media uploaded successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMediaList(req, res, next) {
        try {
            const media = await media_service_1.MediaService.getMediaList();
            (0, response_1.sendSuccess)(res, media, 'Media list fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteMedia(req, res, next) {
        try {
            const { id } = req.params;
            await media_service_1.MediaService.deleteMedia(id);
            (0, response_1.sendSuccess)(res, {}, 'Media deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map
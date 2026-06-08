"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class MediaService {
    static async uploadMedia(data) {
        // Note: Actual file upload to AWS/Cloudinary is mocked here
        return client_1.default.media.create({
            data,
        });
    }
    static async getMediaList() {
        return client_1.default.media.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    static async deleteMedia(id) {
        return client_1.default.media.delete({ where: { id } });
    }
}
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map
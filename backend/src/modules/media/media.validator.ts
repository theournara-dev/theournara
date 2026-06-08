import { z } from 'zod';

export const uploadMediaSchema = z.object({
  // In a real scenario, validation happens via multer or similar, 
  // but for mock/placeholder we accept URL, mimeType, size
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number().int().positive(),
});

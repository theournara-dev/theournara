import { Router } from 'express';
import { MediaController } from './media.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { upload } from '../../middleware/upload';

const router = Router();

router.post('/upload', authenticate, authorize(['Admin', 'Manager']), upload.single('file'), MediaController.uploadMedia);
router.get('/', authenticate, authorize(['Admin', 'Manager']), MediaController.getMediaList);
router.delete('/:id', authenticate, authorize(['Admin', 'Manager']), MediaController.deleteMedia);

export default router;

import { Router } from 'express';
import { SkinQuizController } from './skinQuiz.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { submitQuizSchema } from './skinQuiz.validator';

const router = Router();

router.get('/questions', SkinQuizController.getQuestions);
router.post('/submit', authenticate, validate({ body: submitQuizSchema }), SkinQuizController.submitResponses);

export default router;

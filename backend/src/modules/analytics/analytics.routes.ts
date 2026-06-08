import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/dashboard', authenticate, authorize(['admin', 'manager']), AnalyticsController.getDashboardMetrics);

export default router;

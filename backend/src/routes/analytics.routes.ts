import { Router, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user!.id);
    res.json(stats);
  } catch (error) { next(error); }
});

router.get('/health-score', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const score = await analyticsService.getHealthScore(req.user!.id);
    res.json(score);
  } catch (error) { next(error); }
});

router.get('/trends', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 12;
    const trends = await analyticsService.getSpendingTrends(req.user!.id, months);
    res.json(trends);
  } catch (error) { next(error); }
});

router.get('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comparison = await analyticsService.getCategoryComparison(req.user!.id);
    res.json(comparison);
  } catch (error) { next(error); }
});

export const analyticsRoutes = router;

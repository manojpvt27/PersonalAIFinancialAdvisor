import { Router, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.findAll(req.user!.id, unreadOnly);
    res.json(notifications);
  } catch (error) { next(error); }
});

router.get('/count', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) { next(error); }
});

router.put('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(req.params.id as string, req.user!.id);
    res.json({ message: 'Marked as read' });
  } catch (error) { next(error); }
});

router.put('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ message: 'All marked as read' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.delete(req.params.id as string, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
});

export const notificationRoutes = router;

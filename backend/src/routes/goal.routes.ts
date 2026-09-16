import { Router, Response, NextFunction } from 'express';
import { goalService } from '../services/goal.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goals = await goalService.findAll(req.user!.id);
    res.json(goals);
  } catch (error) { next(error); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.findById(req.params.id as string, req.user!.id);
    res.json(goal);
  } catch (error) { next(error); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.create({ userId: req.user!.id, ...req.body });
    res.status(201).json(goal);
  } catch (error) { next(error); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.update(req.params.id as string, req.user!.id, req.body);
    res.json(goal);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await goalService.delete(req.params.id as string, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:id/contribute', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, note } = req.body;
    const contribution = await goalService.addContribution(req.params.id as string, req.user!.id, amount, note);
    res.status(201).json(contribution);
  } catch (error) { next(error); }
});

export const goalRoutes = router;

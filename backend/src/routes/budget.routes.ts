import { Router, Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budgets = await budgetService.findAll(req.user!.id);
    res.json(budgets);
  } catch (error) { next(error); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budget = await budgetService.findById(req.params.id as string, req.user!.id);
    res.json(budget);
  } catch (error) { next(error); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budget = await budgetService.create({ userId: req.user!.id, ...req.body });
    res.status(201).json(budget);
  } catch (error) { next(error); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budget = await budgetService.update(req.params.id as string, req.user!.id, req.body);
    res.json(budget);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.delete(req.params.id as string, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
});

export const budgetRoutes = router;

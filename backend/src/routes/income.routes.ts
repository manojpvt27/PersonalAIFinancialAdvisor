import { Router, Response, NextFunction } from 'express';
import { incomeService } from '../services/income.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await incomeService.findAll(req.user!.id, page, limit);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/breakdown', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.getSourceBreakdown(
      req.user!.id,
      req.query.startDate as string,
      req.query.endDate as string,
    );
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.findById(req.params.id as string, req.user!.id);
    res.json(income);
  } catch (error) { next(error); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.create({ userId: req.user!.id, ...req.body });
    res.status(201).json(income);
  } catch (error) { next(error); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.update(req.params.id as string, req.user!.id, req.body);
    res.json(income);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.delete(req.params.id as string, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
});

export const incomeRoutes = router;

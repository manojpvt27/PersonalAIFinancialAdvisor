import { Router, Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// GET /api/expenses
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.findAll({
      userId: req.user!.id,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      paymentMethod: req.query.paymentMethod as string,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/expenses/categories
router.get('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.getCategoryBreakdown(
      req.user!.id,
      req.query.startDate as string,
      req.query.endDate as string,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/expenses/trends
router.get('/trends', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 12;
    const result = await expenseService.getMonthlyTrend(req.user!.id, months);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.findById(req.params.id as string, req.user!.id);
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

// POST /api/expenses
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.create({
      userId: req.user!.id,
      ...req.body,
    });
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.update(req.params.id as string, req.user!.id, req.body);
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.delete(req.params.id as string, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const expenseRoutes = router;

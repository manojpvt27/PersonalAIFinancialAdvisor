import { Router, Response, NextFunction } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, email: true, name: true, role: true,
          avatarUrl: true, createdAt: true,
          _count: { select: { expenses: true, incomes: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

// GET /api/admin/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalExpenses, totalIncomes] = await Promise.all([
      prisma.user.count(),
      prisma.expense.count(),
      prisma.income.count(),
    ]);

    res.json({ totalUsers, totalExpenses, totalIncomes });
  } catch (error) { next(error); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'User deleted' });
  } catch (error) { next(error); }
});

export const adminRoutes = router;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { expenseRoutes } from './routes/expense.routes';
import { incomeRoutes } from './routes/income.routes';
import { budgetRoutes } from './routes/budget.routes';
import { goalRoutes } from './routes/goal.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { aiRoutes } from './routes/ai.routes';
import { notificationRoutes } from './routes/notification.routes';
import { adminRoutes } from './routes/admin.routes';

const app = express();

// ============================================
// Security Middleware
// ============================================
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// Body Parsing
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Static Files (for uploaded receipts)
// ============================================
app.use('/uploads', express.static('uploads'));

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// Health Check
// ============================================
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// Error Handling
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║    FinAI Backend Server                  ║
  ║    Running on port ${config.port}                  ║
  ║    Environment: ${config.nodeEnv}            ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;

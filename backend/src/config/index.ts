import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  
  // AI
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    openaiKey: process.env.OPENAI_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
  },
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Redis
  redisUrl: process.env.REDIS_URL || '',
  
  // Categories
  expenseCategories: [
    'food',
    'transportation',
    'shopping',
    'entertainment',
    'healthcare',
    'education',
    'utilities',
    'travel',
    'rent',
    'investments',
    'subscriptions',
    'others',
  ] as const,
  
  incomeSources: [
    'salary',
    'freelance',
    'investment',
    'side_hustle',
    'rental',
    'other',
  ] as const,
  
  paymentMethods: [
    'cash',
    'credit_card',
    'debit_card',
    'upi',
    'net_banking',
    'wallet',
    'other',
  ] as const,
};

export type ExpenseCategory = typeof config.expenseCategories[number];
export type IncomeSource = typeof config.incomeSources[number];
export type PaymentMethod = typeof config.paymentMethods[number];

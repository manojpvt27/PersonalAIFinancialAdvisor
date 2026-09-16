// Type definitions for FinAI Pro - AI Financial OS

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  currency: string;
  preferences?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type AIClassification = 'need' | 'want' | 'investment' | 'recurring' | 'one_time' | 'business' | 'personal';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: string;
  description: string;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  receiptUrl?: string;
  aiCategory?: string;
  aiConfidence?: number;
  aiClassification?: AIClassification;
  isAnomaly?: boolean;
  accountId?: string;
  accountName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseCategory = 
  | 'food' | 'transportation' | 'shopping' | 'entertainment' 
  | 'healthcare' | 'education' | 'utilities' | 'travel' 
  | 'rent' | 'investments' | 'subscriptions' | 'others';

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: IncomeSource;
  type: string;
  date: string;
  description: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt?: string;
}

export type IncomeSource = 'salary' | 'freelance' | 'investment' | 'side_hustle' | 'rental' | 'other';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
  status: 'on_track' | 'warning' | 'exceeded';
  remaining: number;
  period: string;
  startDate?: string;
  endDate?: string;
  alertEnabled: boolean;
  alertThreshold: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: string;
  icon: string;
  color: string;
  percentage: number;
  daysRemaining?: number;
  monthlyRequired?: number;
  isOnTrack?: boolean;
  contributions?: GoalContribution[];
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savings: number;
  netCashFlow: number;
  expenseTrend: number;
  incomeTrend: number;
  categoryBreakdown: Record<string, number>;
  recentTransactions: Expense[];
}

export interface HealthScore {
  score: number;
  grade: string;
  breakdown: Record<string, {
    score: number;
    maxScore: number;
    detail: string;
  }>;
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredDecision?: {
    answer: 'APPROVED' | 'WAIT' | 'CAUTION' | 'REJECT';
    title: string;
    reason: string;
    numbers: { label: string; value: string }[];
    impact: string;
    recommendation: string;
    actions: { label: string; href?: string; type: string }[];
  };
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  accountType: 'bank' | 'credit_card' | 'investment' | 'cash' | 'loan' | 'asset' | 'liability';
  balance: number;
  isLiability: boolean;
  lastSynced: string;
  accountNumberMasked: string;
  status: 'active' | 'syncing' | 'error';
}

export interface SubscriptionItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  usageStatus: 'frequent' | 'moderate' | 'unused' | 'price_increased';
  potentialSavings: number;
  icon: string;
}

export interface BillItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'upcoming' | 'paid' | 'overdue';
  autoPay: boolean;
  account: string;
}

export interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'equity' | 'mutual_fund' | 'crypto' | 'gold' | 'fixed_deposit' | 'real_estate';
  currentValue: number;
  investedAmount: number;
  returnsPercent: number;
  allocationPercent: number;
}

export interface DebtItem {
  id: string;
  name: string;
  institution: string;
  debtType: 'home_loan' | 'car_loan' | 'education_loan' | 'credit_card' | 'personal_loan';
  principalBalance: number;
  interestRate: number;
  monthlyEMI: number;
  remainingTenureMonths: number;
}

export interface AutopilotRule {
  id: string;
  title: string;
  condition: string;
  action: string;
  status: 'active' | 'paused';
  lastTriggered?: string;
}

export interface VaultDocument {
  id: string;
  title: string;
  docType: 'bank_statement' | 'tax_return' | 'insurance_policy' | 'loan_agreement' | 'invoice' | 'salary_slip';
  fileSize: string;
  uploadDate: string;
  extractedMetadata: Record<string, string>;
  tags: string[];
}

// Category metadata
export const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Dining', icon: '🍕', color: '#F97316' },
  transportation: { label: 'Transportation', icon: '🚗', color: '#3B82F6' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  healthcare: { label: 'Healthcare', icon: '🏥', color: '#EF4444' },
  education: { label: 'Education', icon: '📚', color: '#6366F1' },
  utilities: { label: 'Utilities', icon: '💡', color: '#F59E0B' },
  travel: { label: 'Travel', icon: '✈️', color: '#14B8A6' },
  rent: { label: 'Rent & Housing', icon: '🏠', color: '#64748B' },
  investments: { label: 'Investments', icon: '📈', color: '#22C55E' },
  subscriptions: { label: 'Subscriptions', icon: '📱', color: '#A855F7' },
  others: { label: 'Others', icon: '📦', color: '#94A3B8' },
};

export const INCOME_SOURCE_CONFIG: Record<IncomeSource, { label: string; icon: string; color: string }> = {
  salary: { label: 'Salary', icon: '💼', color: '#22C55E' },
  freelance: { label: 'Freelance', icon: '💻', color: '#3B82F6' },
  investment: { label: 'Investment', icon: '📈', color: '#F59E0B' },
  side_hustle: { label: 'Side Hustle', icon: '🚀', color: '#8B5CF6' },
  rental: { label: 'Rental', icon: '🏠', color: '#14B8A6' },
  other: { label: 'Other', icon: '💰', color: '#94A3B8' },
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'net_banking', label: 'Net Banking', icon: '🏦' },
  { value: 'wallet', label: 'Wallet', icon: '👛' },
  { value: 'other', label: 'Other', icon: '💰' },
];

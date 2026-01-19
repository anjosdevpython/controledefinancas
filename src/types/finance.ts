export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix';

export type AccountType = 'checking' | 'savings' | 'investment' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  color: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  accountId: string;
  date: string;
  description?: string;
  paymentMethod: PaymentMethod;
}

export interface SubGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  subGoals?: SubGoal[];
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

import { Transaction, FinancialGoal, MonthlyStats } from '@/types/finance';
import { defaultCategories } from './categories';

const getCategory = (id: string) => defaultCategories.find(c => c.id === id)!;

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 89.90,
    category: getCategory('1'),
    date: '2025-01-17',
    description: 'Supermercado',
    paymentMethod: 'credit',
  },
  {
    id: '2',
    type: 'expense',
    amount: 45.00,
    category: getCategory('2'),
    date: '2025-01-17',
    description: 'Uber para o trabalho',
    paymentMethod: 'pix',
  },
  {
    id: '3',
    type: 'income',
    amount: 5500.00,
    category: getCategory('9'),
    date: '2025-01-05',
    description: 'Salário mensal',
    paymentMethod: 'pix',
  },
  {
    id: '4',
    type: 'expense',
    amount: 1200.00,
    category: getCategory('3'),
    date: '2025-01-10',
    description: 'Aluguel',
    paymentMethod: 'pix',
  },
  {
    id: '5',
    type: 'expense',
    amount: 150.00,
    category: getCategory('6'),
    date: '2025-01-15',
    description: 'Cinema e jantar',
    paymentMethod: 'credit',
  },
  {
    id: '6',
    type: 'income',
    amount: 800.00,
    category: getCategory('10'),
    date: '2025-01-12',
    description: 'Projeto freelance',
    paymentMethod: 'pix',
  },
  {
    id: '7',
    type: 'expense',
    amount: 65.00,
    category: getCategory('4'),
    date: '2025-01-14',
    description: 'Farmácia',
    paymentMethod: 'debit',
  },
  {
    id: '8',
    type: 'expense',
    amount: 49.90,
    category: getCategory('8'),
    date: '2025-01-01',
    description: 'Netflix + Spotify',
    paymentMethod: 'credit',
  },
];

export const mockGoals: FinancialGoal[] = [
  {
    id: '1',
    name: 'Reserva de Emergência',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: '2025-06-01',
    icon: 'Shield',
    color: 'hsl(152 69% 31%)',
  },
  {
    id: '2',
    name: 'Viagem para Europa',
    targetAmount: 12000,
    currentAmount: 3200,
    deadline: '2025-12-01',
    icon: 'Plane',
    color: 'hsl(199 89% 48%)',
  },
  {
    id: '3',
    name: 'MacBook Pro',
    targetAmount: 8000,
    currentAmount: 6400,
    deadline: '2025-03-01',
    icon: 'Laptop',
    color: 'hsl(280 65% 60%)',
  },
];

export const monthlyStats: MonthlyStats[] = [
  { month: 'Set', income: 5800, expense: 4200, balance: 1600 },
  { month: 'Out', income: 6200, expense: 4800, balance: 1400 },
  { month: 'Nov', income: 5500, expense: 5100, balance: 400 },
  { month: 'Dez', income: 7200, expense: 6500, balance: 700 },
  { month: 'Jan', income: 6300, expense: 1599, balance: 4701 },
];

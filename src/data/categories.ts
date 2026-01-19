import { Category } from '@/types/finance';

export const defaultCategories: Category[] = [
  // Expense categories
  { id: '1', name: 'Alimentação', icon: 'UtensilsCrossed', color: 'hsl(38 92% 50%)', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'Car', color: 'hsl(199 89% 48%)', type: 'expense' },
  { id: '3', name: 'Moradia', icon: 'Home', color: 'hsl(280 65% 60%)', type: 'expense' },
  { id: '4', name: 'Saúde', icon: 'Heart', color: 'hsl(0 84% 60%)', type: 'expense' },
  { id: '5', name: 'Educação', icon: 'GraduationCap', color: 'hsl(152 69% 31%)', type: 'expense' },
  { id: '6', name: 'Lazer', icon: 'Gamepad2', color: 'hsl(280 100% 70%)', type: 'expense' },
  { id: '7', name: 'Compras', icon: 'ShoppingBag', color: 'hsl(340 82% 52%)', type: 'expense' },
  { id: '8', name: 'Assinaturas', icon: 'CreditCard', color: 'hsl(215 20% 65%)', type: 'expense' },
  // Income categories
  { id: '9', name: 'Salário', icon: 'Wallet', color: 'hsl(152 69% 31%)', type: 'income' },
  { id: '10', name: 'Freelance', icon: 'Laptop', color: 'hsl(199 89% 48%)', type: 'income' },
  { id: '11', name: 'Investimentos', icon: 'TrendingUp', color: 'hsl(38 92% 50%)', type: 'income' },
  { id: '12', name: 'Outros', icon: 'PlusCircle', color: 'hsl(215 16% 47%)', type: 'income' },
];

export const paymentMethods = [
  { value: 'pix', label: 'PIX', icon: 'Zap' },
  { value: 'credit', label: 'Crédito', icon: 'CreditCard' },
  { value: 'debit', label: 'Débito', icon: 'Banknote' },
  { value: 'cash', label: 'Dinheiro', icon: 'Coins' },
];

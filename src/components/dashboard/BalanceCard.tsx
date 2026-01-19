import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { useFinance } from '@/contexts/FinanceContext';

export function BalanceCard() {
  const { getBalance, getTotalIncome, getTotalExpenses } = useFinance();
  
  const balance = getBalance();
  const income = getTotalIncome();
  const expenses = getTotalExpenses();

  return (
    <Card className="overflow-hidden bg-primary text-primary-foreground shadow-lg">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">Saldo atual</span>
        </div>
        <p className="mb-6 text-4xl font-bold tracking-tight">
          {formatCurrency(balance)}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs opacity-80">Receitas</p>
              <p className="font-semibold">{formatCurrency(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs opacity-80">Despesas</p>
              <p className="font-semibold">{formatCurrency(expenses)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

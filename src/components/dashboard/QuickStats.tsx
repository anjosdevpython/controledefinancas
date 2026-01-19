import { ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { useFinance } from '@/contexts/FinanceContext';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  variant: 'income' | 'expense' | 'neutral';
}

function StatCard({ title, value, change, icon, variant }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${variant === 'income' ? 'bg-accent text-accent-foreground' :
            variant === 'expense' ? 'bg-destructive/10 text-destructive' :
              'bg-secondary text-secondary-foreground'
            }`}>
            {icon}
          </div>
        </div>
        <p className="text-xl font-bold">{value}</p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-income" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-expense" />
          )}
          <span className={isPositive ? 'text-income' : 'text-expense'}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">vs mês anterior</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  const { getTotalIncome, getTotalExpenses } = useFinance();

  const income = getTotalIncome();
  const expenses = getTotalExpenses();

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        title="Receitas"
        value={formatCurrency(income)}
        change={0}
        icon={<ArrowUpRight className="h-4 w-4" />}
        variant="income"
      />
      <StatCard
        title="Despesas"
        value={formatCurrency(expenses)}
        change={0}
        icon={<ArrowDownRight className="h-4 w-4" />}
        variant="expense"
      />
    </div>
  );
}

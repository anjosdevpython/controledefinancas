import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useFinance } from '@/contexts/FinanceContext';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface RecentTransactionsProps {
  onSeeAll?: () => void;
}

export function RecentTransactions({ onSeeAll }: RecentTransactionsProps) {
  const { transactions } = useFinance();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Últimas transações</CardTitle>
        <Button variant="ghost" size="sm" onClick={onSeeAll} className="text-xs text-muted-foreground">
          Ver todas
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
            >
              <CategoryIcon
                icon={transaction.category.icon}
                color={transaction.category.color}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{transaction.category.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {transaction.description || 'Sem descrição'} • {formatDate(transaction.date)}
                </p>
              </div>
              <p
                className={`font-semibold tabular-nums ${
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

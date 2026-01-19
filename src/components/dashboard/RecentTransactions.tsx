import { ChevronRight, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useFinance } from '@/contexts/FinanceContext';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Transaction } from '@/types/finance';

interface RecentTransactionsProps {
  onSeeAll?: () => void;
  onEdit?: (transaction: Transaction) => void;
}

export function RecentTransactions({ onSeeAll, onEdit }: RecentTransactionsProps) {
  const { transactions } = useFinance();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Últimas transações</CardTitle>
        <Button variant="ghost" size="sm" onClick={onSeeAll} className="text-xs text-muted-foreground group">
          Ver todas
          <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4 italic">Nenhuma transação recente.</p>
          ) : (
            recentTransactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => onEdit?.(transaction)}
                className="w-full flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-primary/5 active:scale-[0.98] group text-left"
                title="Clique para editar"
              >
                <CategoryIcon
                  icon={transaction.category.icon}
                  color={transaction.category.color}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm truncate">{transaction.category.name}</p>
                    <Edit2 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-wider">
                    {transaction.description || 'Sem descrição'} • {formatDate(transaction.date)}
                  </p>
                </div>
                <p
                  className={`font-bold tabular-nums text-sm ${transaction.type === 'income' ? 'text-income' : 'text-expense'
                    }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

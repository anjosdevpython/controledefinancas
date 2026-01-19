import { Wallet, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { useFinance } from '@/contexts/FinanceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/lib/utils';

export function BalanceCard() {
  const { getBalance, getTotalIncome, getTotalExpenses, loading, accounts } = useFinance();
  const { selectedAccountId, setSelectedAccountId } = useFinanceStore();

  const balance = getBalance(selectedAccountId || undefined);


  const activeAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <Card className="overflow-hidden bg-primary text-primary-foreground shadow-lg border-none relative">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">
              {activeAccount ? activeAccount.name : 'Saldo Total'}
            </span>
          </div>

          {accounts.length > 1 && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 max-w-[200px]">
              <button
                onClick={() => setSelectedAccountId(null)}
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold transition-all",
                  !selectedAccountId ? "bg-white text-primary" : "bg-white/15 hover:bg-white/25"
                )}
              >
                Geral
              </button>
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all",
                    selectedAccountId === acc.id ? "bg-white text-primary" : "bg-white/15 hover:bg-white/25"
                  )}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="mb-6 space-y-2">
            <Skeleton className="h-10 w-48 bg-white/20" />
          </div>
        ) : (
          <p className="mb-6 text-4xl font-bold tracking-tight animate-in fade-in slide-in-from-left duration-500">
            {formatCurrency(balance)}
          </p>
        )}


      </CardContent>
    </Card>
  );
}

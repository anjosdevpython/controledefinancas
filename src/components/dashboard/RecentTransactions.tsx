import { ChevronRight, Edit2, Search, FilterX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useFinance } from '@/contexts/FinanceContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Transaction } from '@/types/finance';

interface RecentTransactionsProps {
  onSeeAll?: () => void;
  onEdit?: (transaction: Transaction) => void;
  showAll?: boolean;
}

export function RecentTransactions({ onSeeAll, onEdit, showAll = false }: RecentTransactionsProps) {
  const { transactions, categories } = useFinance();
  const {
    searchQuery,
    setSearchQuery,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedCategoryId,
    setSelectedCategoryId,
    resetFilters,
    filterTransactions
  } = useFinanceStore();

  const filteredTransactions = filterTransactions(transactions);
  const displayTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

  const months = [
    { value: '0', label: 'Janeiro' },
    { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' },
    { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' },
    { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' },
    { value: '11', label: 'Dezembro' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  const hasActiveFilters = searchQuery || selectedMonth !== null || selectedYear !== null || selectedCategoryId;

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader className="flex flex-col space-y-4 pb-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {showAll ? 'Todas as transações' : 'Últimas transações'}
          </CardTitle>
          {!showAll && (
            <Button variant="ghost" size="sm" onClick={onSeeAll} className="text-xs text-muted-foreground group">
              Ver todas
              <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-secondary/30 border-none focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
            <Select
              value={selectedMonth?.toString() || "all"}
              onValueChange={(val) => setSelectedMonth(val === "all" ? null : parseInt(val))}
            >
              <SelectTrigger className="h-9 w-[130px] rounded-lg bg-secondary/20 border-none text-xs font-medium shrink-0">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear?.toString() || "all"}
              onValueChange={(val) => setSelectedYear(val === "all" ? null : parseInt(val))}
            >
              <SelectTrigger className="h-9 w-[90px] rounded-lg bg-secondary/20 border-none text-xs font-medium shrink-0">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategoryId || "all"}
              onValueChange={(val) => setSelectedCategoryId(val === "all" ? null : val)}
            >
              <SelectTrigger className="h-9 w-[140px] rounded-lg bg-secondary/20 border-none text-xs font-medium shrink-0">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 w-9 p-0 rounded-lg text-destructive hover:bg-destructive/10 shrink-0"
                title="Limpar filtros"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          {displayTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground italic">Nenhuma transação encontrada.</p>
              {hasActiveFilters && (
                <Button variant="link" size="sm" onClick={resetFilters} className="text-primary mt-1">
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            displayTransactions.map((transaction) => (
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

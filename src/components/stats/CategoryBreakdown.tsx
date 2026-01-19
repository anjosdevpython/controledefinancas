import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { defaultCategories } from '@/data/categories';

export function CategoryBreakdown() {
  const { getExpensesByCategory, getTotalExpenses } = useFinance();
  const categoryData = getExpensesByCategory();
  const totalExpenses = getTotalExpenses();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Detalhes por categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryData.map((item, index) => {
          const category = defaultCategories.find(c => c.name === item.name);
          const percentage = (item.value / totalExpenses) * 100;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category && (
                    <CategoryIcon icon={category.icon} color={item.color} size="sm" />
                  )}
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
        
        {categoryData.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma despesa registrada
          </p>
        )}
      </CardContent>
    </Card>
  );
}

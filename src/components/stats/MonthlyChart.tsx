import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/formatters';

export function MonthlyChart() {
  const { transactions } = useFinance();

  // Process transactions to get monthly data
  const getMonthlyData = () => {
    const months: { [key: string]: { month: string; income: number; expense: number } } = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // If no transactions, return empty or last 5 months as empty
    if (transactions.length === 0) return [];

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = monthNames[date.getMonth()];

      if (!months[monthKey]) {
        months[monthKey] = { month: monthLabel, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expense += t.amount;
      }
    });

    return Object.values(months).slice(-5);
  };

  const data = getMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
          <p className="mb-2 font-semibold">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Evolução financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Sem dados suficientes para o gráfico</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Receitas"
                  fill="hsl(var(--income))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Despesas"
                  fill="hsl(var(--expense))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

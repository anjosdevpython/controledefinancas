import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';

const insights = [
  {
    type: 'success',
    icon: TrendingDown,
    title: 'Ótimo trabalho!',
    message: 'Seus gastos diminuíram 75% comparado ao mês passado.',
  },
  {
    type: 'warning',
    icon: AlertTriangle,
    title: 'Atenção com alimentação',
    message: 'Você já gastou R$ 89,90 em alimentação este mês.',
  },
  {
    type: 'tip',
    icon: Lightbulb,
    title: 'Dica do dia',
    message: 'Guardar 20% do salário pode ajudar a atingir suas metas mais rápido!',
  },
];

export function InsightCard() {
  const { transactions } = useFinance();

  // Filter for dynamic insights based on data
  const hasData = transactions.length > 0;

  const defaultInsight = {
    type: 'tip',
    icon: Lightbulb,
    title: 'Dica do dia',
    message: 'Guardar 20% do salário pode ajudar a atingir suas metas mais rápido!',
  };

  const insight = hasData ? insights[0] : defaultInsight;
  const Icon = insight.icon;

  if (!hasData) {
    return (
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{defaultInsight.title}</p>
            <p className="text-sm text-muted-foreground">{defaultInsight.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 shadow-sm ${insight.type === 'success' ? 'border-l-income' :
      insight.type === 'warning' ? 'border-l-warning' :
        'border-l-primary'
      }`}>
      <CardContent className="flex items-start gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${insight.type === 'success' ? 'bg-accent text-accent-foreground' :
          insight.type === 'warning' ? 'bg-warning/10 text-warning' :
            'bg-secondary text-secondary-foreground'
          }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{insight.title}</p>
          <p className="text-sm text-muted-foreground">{insight.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

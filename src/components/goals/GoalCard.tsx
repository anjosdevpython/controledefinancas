import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { FinancialGoal } from '@/types/finance';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface GoalCardProps {
  goal: FinancialGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const deadline = new Date(goal.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <CategoryIcon icon={goal.icon} color={goal.color} size="lg" />
          <div className="flex-1">
            <h3 className="font-semibold">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">
              {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Meta vencida'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: goal.color }}>
              {Math.round(progress)}%
            </p>
          </div>
        </div>
        
        <Progress
          value={progress}
          className="mb-3 h-2"
          style={{ '--progress-color': goal.color } as any}
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className="font-medium">
            Meta: {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        
        {remaining > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Faltam {formatCurrency(remaining)} para atingir a meta
          </p>
        )}
      </CardContent>
    </Card>
  );
}

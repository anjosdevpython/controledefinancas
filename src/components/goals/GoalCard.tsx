import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import { FinancialGoal } from '@/types/finance';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { useFinance } from '@/contexts/FinanceContext';
import { PlusCircle, Trash2 } from 'lucide-react';

interface GoalCardProps {
  goal: FinancialGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { updateGoal, deleteGoal } = useFinance();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await updateGoal(goal.id, parseFloat(amount));
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Deseja excluir esta meta?')) {
      await deleteGoal(goal.id);
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg group">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-4">
          <CategoryIcon icon={goal.icon} color={goal.color} size="lg" />
          <div className="flex-1">
            <h3 className="text-lg font-bold tracking-tight">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">
              {goal.deadline ? `Prazo: ${new Date(goal.deadline).toLocaleDateString()}` : 'Sem prazo'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xl font-black" style={{ color: goal.color }}>
              {Math.round(progress)}%
            </p>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-1 rounded"
              title="Excluir meta"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <Progress
            value={progress}
            className="h-2.5 bg-secondary"
            style={{ '--progress-color': goal.color } as any}
          />
        </div>

        <div className="mb-6 flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Guardado</span>
            <span className="text-lg font-bold">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Meta</span>
            <span className="text-lg font-bold text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>

        {remaining > 0 ? (
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 text-sm"
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="gap-2 shadow-lg shadow-primary/10 whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center">
            <p className="text-sm font-bold text-green-500">✨ Meta alcançada! Parabéns!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import { FinancialGoal } from '@/types/finance';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { useFinance } from '@/contexts/FinanceContext';
import { PlusCircle, Trash2, Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GoalCardProps {
  goal: FinancialGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { updateGoal, deleteGoal, getGoalPrediction } = useFinance();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSubGoals, setShowSubGoals] = useState(false);

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const prediction = getGoalPrediction(goal.id);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [goal.color, '#FFD700', '#FFFFFF']
    });
  };

  useEffect(() => {
    if (progress >= 100) {
      // Check if it's the first time hitting 100 in this session or just loaded
      // For simplicity, we just trigger if it's exactly 100 or higher
    }
  }, [progress]);

  const handleDeposit = async (subGoalId?: string) => {
    const value = parseFloat(amount);
    if (!amount || value <= 0) return;
    setLoading(true);
    try {
      await updateGoal(goal.id, value, subGoalId);
      setAmount('');
      if (progress + (value / goal.targetAmount * 100) >= 100) {
        triggerConfetti();
        toast.success(`Meta "${goal.name}" completada! 🎉`);
      }
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
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">{goal.name}</h3>
              {prediction && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  Previsto: {new Date(prediction.estimatedDate).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                </div>
              )}
            </div>
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

        {/* Sub-goals Section */}
        {goal.subGoals && goal.subGoals.length > 0 && (
          <div className="mb-4 space-y-2">
            <button
              onClick={() => setShowSubGoals(!showSubGoals)}
              className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {showSubGoals ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Etapas da Meta ({goal.subGoals.filter(sg => sg.isCompleted).length}/{goal.subGoals.length})
            </button>

            {showSubGoals && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                {goal.subGoals.map(sg => (
                  <div key={sg.id} className="bg-secondary/20 p-2 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-xs font-bold", sg.isCompleted ? "text-green-500" : "")}>
                        {sg.name}
                      </span>
                      {sg.isCompleted && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                    </div>
                    <Progress value={(sg.currentAmount / sg.targetAmount) * 100} className="h-1 bg-secondary/50" />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatCurrency(sg.currentAmount)} / {formatCurrency(sg.targetAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              onClick={() => handleDeposit()}
              disabled={loading || !amount}
              className="gap-2 shadow-lg shadow-primary/10 whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center cursor-pointer hover:bg-green-500/20 transition-colors" onClick={triggerConfetti}>
            <p className="text-sm font-bold text-green-500">✨ Meta alcançada! Parabéns!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

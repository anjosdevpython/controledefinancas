import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Target, Calendar } from 'lucide-react';

interface AddGoalSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddGoalSheet({ open, onOpenChange }: AddGoalSheetProps) {
    const { addGoal } = useFinance();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) return;

        setLoading(true);
        try {
            await addGoal({
                name,
                targetAmount: Number(targetAmount),
                currentAmount: 0,
                deadline: deadline || undefined,
                icon: 'Target',
                color: '#8B5CF6', // Primary color
            });
            setName('');
            setTargetAmount('');
            setDeadline('');
            onOpenChange(false);
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="sm:max-w-[400px] rounded-t-xl mx-auto">
                <SheetHeader>
                    <SheetTitle>Nova Meta Financeira</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Meta</Label>
                        <div className="relative">
                            <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                placeholder="Ex: Reserva de Emergência"
                                className="pl-10"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor Alvo (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0,00"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deadline">Prazo (Opcional)</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="deadline"
                                type="date"
                                className="pl-10"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                    </div>

                    <SheetFooter className="pt-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Salvando...' : 'Criar Meta'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

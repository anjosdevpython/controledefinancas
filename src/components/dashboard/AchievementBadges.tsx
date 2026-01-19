import { useFinanceStore } from '@/store/useFinanceStore';
import { useFinance } from '@/contexts/FinanceContext';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

export function AchievementBadges() {
    const { achievements, checkAchievements } = useFinanceStore();
    const { transactions, goals } = useFinance();

    useEffect(() => {
        checkAchievements(transactions, goals);
    }, [transactions, goals, checkAchievements]);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (unlockedCount === 0) return null;

    return (
        <TooltipProvider>
            <div className="flex -space-x-2 overflow-hidden px-2">
                {achievements.filter(a => a.unlocked).map((ach) => {
                    return (
                        <Tooltip key={ach.id}>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "relative cursor-help"
                                    )}
                                >
                                    <CategoryIcon icon={ach.icon} color={ach.color} size="sm" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs p-3">
                                <p className="font-bold text-sm mb-1">{ach.title}</p>
                                <p className="text-xs text-muted-foreground">{ach.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}

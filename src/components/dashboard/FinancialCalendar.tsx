import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export function FinancialCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { transactions } = useFinance();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

    const getDayTransactions = (day: Date) => {
        return transactions.filter(t => isSameDay(new Date(t.date), day));
    };

    return (
        <Card className="shadow-sm border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-secondary/20">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-7 gap-px bg-border">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="bg-card py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {day}
                        </div>
                    ))}
                    {/* Empty cells for start padding */}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-secondary/5 h-20 sm:h-24" />
                    ))}
                    {/* Month days */}
                    {days.map(day => {
                        const dayTransactions = getDayTransactions(day);
                        const dailyIncome = dayTransactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + t.amount, 0);
                        const dailyExpense = dayTransactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + t.amount, 0);

                        return (
                            <div key={day.toISOString()} className="bg-card h-20 sm:h-24 p-1 flex flex-col group hover:bg-primary/5 transition-colors border-t border-border/50">
                                <span className={cn(
                                    "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                                    isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                                    {dailyIncome > 0 && (
                                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-income bg-income/10 rounded px-1 py-0.5">
                                            <TrendingUp className="h-2 w-2" />
                                            <span className="truncate">{formatCurrency(dailyIncome).replace('R$', '')}</span>
                                        </div>
                                    )}
                                    {dailyExpense > 0 && (
                                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-expense bg-expense/10 rounded px-1 py-0.5">
                                            <TrendingDown className="h-2 w-2" />
                                            <span className="truncate">{formatCurrency(dailyExpense).replace('R$', '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

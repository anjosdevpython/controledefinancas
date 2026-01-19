import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { getGeminiFinancialTip } from '@/services/gemini';

export function InsightCard() {
  const { transactions, getFinancialSummary } = useFinance();
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAiTip = async () => {
      setLoading(true);
      try {
        const summary = getFinancialSummary();
        const tip = await getGeminiFinancialTip(summary);
        setAiTip(tip);
      } catch (error) {
        console.error('Failed to fetch AI tip:', error);
      } finally {
        setLoading(false);
      }
    };

    if (transactions.length > 0) {
      fetchAiTip();
    } else {
      setLoading(false);
    }
  }, [transactions.length, getFinancialSummary]); // Refetch if transactions change

  if (loading) {
    return (
      <Card className="border-l-4 border-l-primary shadow-md bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-3 text-sm font-medium text-muted-foreground animate-pulse">
            Anjo Financeiro analisando seus dados...
          </span>
        </CardContent>
      </Card>
    );
  }

  const hasData = transactions.length > 0;

  const displayTip = aiTip || 'Comece a registrar suas transações para receber dicas personalizadas do seu Anjo Financeiro!';
  const title = hasData ? 'Dica da IA' : 'Dica do dia';

  return (
    <Card className="border-l-4 border-l-primary shadow-md bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-base tracking-tight">{title}</p>
            {hasData && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase text-primary tracking-wider">
                Gemini AI
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            "{displayTip}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { getAIFinancialTip } from '@/services/ai';

import { useAuth } from '@/contexts/AuthContext';

export function InsightCard() {
  const { transactions, getFinancialSummary } = useFinance();
  const { user } = useAuth();
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateTip = async () => {
    if (transactions.length === 0) return;

    setLoading(true);
    try {
      const summary = getFinancialSummary();
      // Personalization: Use first name or email fallback
      const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0];
      const tip = await getAIFinancialTip(summary, userName);
      setAiTip(tip);
    } catch (error) {
      console.error('Failed to fetch AI tip:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasData = transactions.length > 0;
  const displayTip = aiTip || 'Clique no botão abaixo para receber uma dica personalizada do seu Anjo Financeiro!';

  return (
    <Card className="border-l-4 border-l-primary shadow-md bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-base tracking-tight">Dica do Anjo</p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              "{displayTip}"
            </p>
          </div>
        </div>

        {hasData && (
          <Button
            onClick={handleGenerateTip}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full mt-2 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all group"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
            )}
            {aiTip ? 'Gerar outra dica' : 'Gerar minha dica'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

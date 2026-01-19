import { useState } from 'react';
import { X, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFinance } from '@/contexts/FinanceContext';
import { TransactionType, PaymentMethod } from '@/types/finance';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { paymentMethods } from '@/data/categories';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionSheet({ open, onOpenChange }: AddTransactionSheetProps) {
  const { categories, addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSubmit = () => {
    if (!amount || !categoryId) return;

    addTransaction({
      type,
      amount: parseFloat(amount.replace(',', '.')),
      category: selectedCategory!,
      date,
      description: description || undefined,
      paymentMethod,
    });

    // Reset form
    setAmount('');
    setCategoryId('');
    setDescription('');
    setPaymentMethod('pix');
    onOpenChange(false);
  };

  const formatAmountInput = (value: string) => {
    const numericValue = value.replace(/[^\d,]/g, '');
    setAmount(numericValue);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center text-xl">
            {type === 'expense' ? 'Nova despesa' : 'Nova receita'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2 rounded-lg bg-secondary p-1">
            <button
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={cn(
                'flex-1 rounded-md py-2.5 text-sm font-medium transition-all',
                type === 'expense'
                  ? 'bg-expense text-expense-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              Despesa
            </button>
            <button
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={cn(
                'flex-1 rounded-md py-2.5 text-sm font-medium transition-all',
                type === 'income'
                  ? 'bg-income text-income-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              Receita
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => formatAmountInput(e.target.value)}
                className="h-14 pl-12 text-2xl font-bold"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all',
                    categoryId === cat.id
                      ? 'bg-secondary ring-2 ring-primary'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                  <span className="text-xs font-medium truncate w-full text-center">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((method) => {
                const Icon = (LucideIcons as any)[method.icon];
                return (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all',
                      paymentMethod === method.value
                        ? 'bg-secondary ring-2 ring-primary'
                        : 'hover:bg-secondary/50'
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Supermercado, conta de luz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || !categoryId}
            className="h-14 w-full text-base font-semibold"
          >
            <Check className="mr-2 h-5 w-5" />
            Salvar {type === 'expense' ? 'despesa' : 'receita'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

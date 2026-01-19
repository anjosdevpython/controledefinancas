import { useState, useEffect } from 'react';
import { X, Check, Save } from 'lucide-react';
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
import { Transaction, TransactionType, PaymentMethod } from '@/types/finance';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { paymentMethods } from '@/data/categories';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: Transaction | null;
}

export function AddTransactionSheet({ open, onOpenChange, transactionToEdit }: AddTransactionSheetProps) {
  const { categories, addTransaction, updateTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const isEditing = !!transactionToEdit;

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount.toString().replace('.', ','));
        setCategoryId(transactionToEdit.category.id);
        setDate(transactionToEdit.date);
        setDescription(transactionToEdit.description || '');
        setPaymentMethod(transactionToEdit.paymentMethod || 'pix');
      } else {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setPaymentMethod('pix');
      }
    }
  }, [open, transactionToEdit]);

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSubmit = async () => {
    if (!amount || !categoryId) return;

    const transactionData = {
      type,
      amount: parseFloat(amount.replace(',', '.')),
      category: selectedCategory!,
      date,
      description: description || undefined,
      paymentMethod,
    };

    if (isEditing && transactionToEdit) {
      await updateTransaction(transactionToEdit.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }

    onOpenChange(false);
  };

  const formatAmountInput = (value: string) => {
    const numericValue = value.replace(/[^\d,]/g, '');
    setAmount(numericValue);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl border-t border-primary/20">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center text-xl font-bold">
            {isEditing ? 'Editar transação' : (type === 'expense' ? 'Nova despesa' : 'Nova receita')}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Type Toggle */}
          {!isEditing && (
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
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold opacity-70">Valor</Label>
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
                className="h-14 pl-12 text-2xl font-bold rounded-xl focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold opacity-70">Categoria</Label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all',
                    categoryId === cat.id
                      ? 'bg-primary/10 ring-1 ring-primary'
                      : 'bg-secondary/40 hover:bg-secondary/60'
                  )}
                >
                  <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                  <span className="text-[10px] font-bold truncate w-full text-center uppercase tracking-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold opacity-70">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold opacity-70">Forma de pagamento</Label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((method) => {
                const Icon = (LucideIcons as any)[method.icon];
                return (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all',
                      paymentMethod === method.value
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'bg-secondary/40 hover:bg-secondary/60'
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold opacity-70">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Supermercado, conta de luz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none rounded-xl"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || !categoryId}
            className="h-14 w-full text-base font-bold rounded-xl shadow-lg active:scale-95 transition-all"
          >
            {isEditing ? <Save className="mr-2 h-5 w-5" /> : <Check className="mr-2 h-5 w-5" />}
            {isEditing ? 'Confirmar alteração' : `Salvar ${type === 'expense' ? 'despesa' : 'receita'}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

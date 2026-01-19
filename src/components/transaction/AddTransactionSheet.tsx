import { useState, useEffect } from 'react';
import { X, Check, Save, Trash2, AlertCircle } from 'lucide-react';
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
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive('O valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().min(1, 'A data é obrigatória'),
  description: z.string().max(100, 'A descrição deve ter no máximo 100 caracteres').optional(),
  paymentMethod: z.string(),
});

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: Transaction | null;
}

export function AddTransactionSheet({ open, onOpenChange, transactionToEdit }: AddTransactionSheetProps) {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!transactionToEdit;

  useEffect(() => {
    if (open) {
      setShowConfirmDelete(false);
      setErrors({});
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
    setErrors({});

    const numericAmount = parseFloat(amount.replace(',', '.'));

    const result = transactionSchema.safeParse({
      amount: numericAmount,
      categoryId,
      date,
      description,
      paymentMethod,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const transactionData = {
      type,
      amount: numericAmount,
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

  const handleDelete = async () => {
    if (transactionToEdit) {
      await deleteTransaction(transactionToEdit.id);
      onOpenChange(false);
    }
  };

  const formatAmountInput = (value: string) => {
    const numericValue = value.replace(/[^\d,]/g, '');
    setAmount(numericValue);
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
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
                onClick={() => { setType('expense'); setCategoryId(''); setErrors({}); }}
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
                onClick={() => { setType('income'); setCategoryId(''); setErrors({}); }}
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
            <div className="flex justify-between">
              <Label htmlFor="amount" className="text-sm font-semibold opacity-70">Valor</Label>
              {errors.amount && (
                <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.amount}
                </span>
              )}
            </div>
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
                className={cn(
                  "h-14 pl-12 text-2xl font-bold rounded-xl focus:ring-primary/20",
                  errors.amount && "border-destructive/50 bg-destructive/5"
                )}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-semibold opacity-70">Categoria</Label>
              {errors.categoryId && (
                <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.categoryId}
                </span>
              )}
            </div>
            <div className={cn(
              "grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 p-1 rounded-xl transition-colors",
              errors.categoryId && "bg-destructive/5 ring-1 ring-destructive/20"
            )}>
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(cat.id); setErrors(prev => ({ ...prev, categoryId: '' })); }}
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
            <div className="flex justify-between">
              <Label htmlFor="description" className="text-sm font-semibold opacity-70">Descrição (opcional)</Label>
              {errors.description && (
                <span className="text-[10px] font-bold text-destructive">
                  {errors.description}
                </span>
              )}
            </div>
            <Textarea
              id="description"
              placeholder="Ex: Supermercado, conta de luz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                "resize-none rounded-xl",
                errors.description && "border-destructive/50 bg-destructive/5"
              )}
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pb-4">
            <Button
              onClick={handleSubmit}
              className="h-14 w-full text-base font-bold rounded-xl shadow-lg active:scale-95 transition-all"
            >
              {isEditing ? <Save className="mr-2 h-5 w-5" /> : <Check className="mr-2 h-5 w-5" />}
              {isEditing ? 'Confirmar alteração' : `Salvar ${type === 'expense' ? 'despesa' : 'receita'}`}
            </Button>

            {isEditing && (
              <>
                {!showConfirmDelete ? (
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirmDelete(true)}
                    className="h-12 w-full text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir esta transação
                  </Button>
                ) : (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="h-12 flex-1 font-bold rounded-xl"
                    >
                      Sim, excluir
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDelete(false)}
                      className="h-12 flex-1 font-bold rounded-xl"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

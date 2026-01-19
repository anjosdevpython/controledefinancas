import { CategoryManager } from '@/components/settings/CategoryManager';
import { useState, useEffect, useRef } from 'react';
import { X, Check, Save, Trash2, AlertCircle, Camera, Loader2, RefreshCw, Crosshair } from 'lucide-react';
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
import { scanReceipt } from '@/services/ai';
import { toast } from 'sonner';

const transactionSchema = z.object({
  amount: z.number().positive('O valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  accountId: z.string().min(1, 'Selecione uma conta'),
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
  const { categories, accounts, goals, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [goalId, setGoalId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!transactionToEdit;

  useEffect(() => {
    if (open) {
      setShowConfirmDelete(false);
      setErrors({});
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount.toString().replace('.', ','));
        setCategoryId(transactionToEdit.category.id);
        setAccountId(transactionToEdit.accountId);
        setDate(transactionToEdit.date);
        setDescription(transactionToEdit.description || '');
        setPaymentMethod(transactionToEdit.paymentMethod || 'pix');
        setIsRecurring(Boolean((transactionToEdit as any).is_recurring));
        setGoalId((transactionToEdit as any).goal_id || '');
      } else {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setAccountId(accounts[0]?.id || 'default');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setPaymentMethod('pix');
        setIsRecurring(false);
        setGoalId('');
      }
    }
  }, [open, transactionToEdit, accounts]);

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.info('Escaneando comprovante... Isso pode levar alguns segundos.');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await scanReceipt(base64);

        if (data) {
          setAmount(data.amount.toString().replace('.', ','));
          setDescription(data.description);
          setDate(data.date);

          const category = categories.find(c =>
            c.name.toLowerCase().includes(data.categoryName.toLowerCase()) ||
            data.categoryName.toLowerCase().includes(c.name.toLowerCase())
          );
          if (category) setCategoryId(category.id);

          toast.success('Comprovante escaneado com sucesso!');
        } else {
          toast.error('Não foi possível ler o comprovante. Tente novamente.');
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar imagem.');
      setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    const numericAmount = parseFloat(amount.replace(',', '.'));

    const result = transactionSchema.safeParse({
      amount: numericAmount,
      categoryId,
      accountId,
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
      accountId,
      date,
      description: description || undefined,
      paymentMethod,
      is_recurring: isRecurring // This will be sent as part of the Partial<Transaction> or any
    };

    if (isEditing && transactionToEdit) {
      await updateTransaction(transactionToEdit.id, transactionData as any);
    } else {
      await addTransaction(transactionData as any, goalId || undefined);
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
          {/* Action Row: Type + OCR */}
          <div className="flex gap-2">
            {!isEditing && (
              <div className="flex-1 flex gap-2 rounded-lg bg-secondary p-1">
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
            {type === 'expense' && !isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleScanReceipt}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="h-12 w-12 rounded-xl border-dashed border-primary/30 text-primary"
                >
                  {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>

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

          {/* Account/Wallet Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold opacity-70">Conta / Carteira</Label>
            <div className="grid grid-cols-2 gap-2">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccountId(acc.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl p-3 transition-all border text-left',
                    accountId === acc.id
                      ? 'bg-primary/10 border-primary ring-1 ring-primary'
                      : 'bg-card border-border hover:bg-secondary/40'
                  )}
                >
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: acc.color }} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold truncate">{acc.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{acc.type}</span>
                  </div>
                </button>
              ))}
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

          {/* Goal selection (Optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold opacity-70 flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Vincular à Meta (Opcional)
            </Label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="">Nenhuma meta selecionada</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Recurring */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold opacity-70">Recorrente?</Label>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={cn(
                  "flex items-center justify-between w-full h-12 px-4 rounded-xl border transition-all",
                  isRecurring ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card border-border hover:bg-secondary/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className={cn("h-4 w-4", isRecurring ? "text-primary animate-spin-slow" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-bold", isRecurring ? "text-primary" : "text-muted-foreground")}>
                    {isRecurring ? 'Mensal' : 'Não'}
                  </span>
                </div>
                <div className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  isRecurring ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    isRecurring ? "left-6" : "left-1"
                  )} />
                </div>
              </button>
            </div>
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

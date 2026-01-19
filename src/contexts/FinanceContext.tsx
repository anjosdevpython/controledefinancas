import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Transaction, FinancialGoal, Category } from '@/types/finance';
import { defaultCategories } from '@/data/categories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FinanceContextType {
  transactions: Transaction[];
  goals: FinancialGoal[];
  categories: Category[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoal: (id: string, amount: number) => Promise<void>;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getExpensesByCategory: () => { name: string; value: number; color: string }[];
  getFinancialSummary: () => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Categories are static for now
  const categories = useMemo(() => defaultCategories, []);

  // --- QUERIES ---

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        amount: Number(t.amount),
        date: t.date,
        description: t.description || '',
        paymentMethod: t.payment_method as any,
        category: defaultCategories.find(c => c.id === t.category_id) || defaultCategories[0],
      }));
    },
    enabled: !!user,
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return (data || []).map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        deadline: g.deadline || '',
        icon: g.icon || 'Target',
        color: g.color || '#primary',
      }));
    },
    enabled: !!user,
  });

  const loading = loadingTransactions || loadingGoals;

  // --- MUTATIONS ---

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: transaction.type,
          amount: transaction.amount,
          category_id: transaction.category.id,
          date: transaction.date,
          description: transaction.description,
          payment_method: transaction.paymentMethod,
          user_id: user?.id
        }])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast.success('Transação adicionada!');
      addNotification({
        title: variables.type === 'income' ? 'Nova Receita' : 'Nova Despesa',
        message: `${variables.description || 'Sem descrição'}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(variables.amount)}`,
        type: 'success'
      });
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar transação: ' + error.message);
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, fields }: { id: string, fields: Partial<Transaction> }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          type: fields.type,
          amount: fields.amount,
          category_id: fields.category?.id,
          date: fields.date,
          description: fields.description,
          payment_method: fields.paymentMethod,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast.success('Transação atualizada!');
      addNotification({
        title: 'Transação Atualizada',
        message: `Sua transação foi corrigida com sucesso.`,
        type: 'success'
      });
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar transação: ' + error.message);
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast.success('Transação excluída.');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir: ' + error.message);
    }
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goal: Omit<FinancialGoal, 'id'>) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          icon: goal.icon,
          color: goal.color,
          user_id: user?.id
        }])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      toast.success('Meta criada com sucesso!');
      addNotification({
        title: 'Nova Meta Financeira',
        message: `O objetivo "${variables.name}" foi criado com sucesso!`,
        type: 'success'
      });
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar meta: ' + error.message);
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      toast.success('Meta excluída.');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir meta: ' + error.message);
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id);

      if (error) throw error;
      return { goalName: goal.name, addedAmount: amount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      if (data) {
        addNotification({
          title: 'Progresso na Meta',
          message: `Você guardou ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.addedAmount)} para "${data.goalName}"!`,
          type: 'success'
        });
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar meta: ' + error.message);
    }
  });

  // --- HELPERS ---

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getExpensesByCategory = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: { [key: string]: { name: string; value: number; color: string } } = {};

    expenses.forEach(t => {
      if (categoryTotals[t.category.id]) {
        categoryTotals[t.category.id].value += t.amount;
      } else {
        categoryTotals[t.category.id] = {
          name: t.category.name,
          value: t.amount,
          color: t.category.color,
        };
      }
    });

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  };

  const getFinancialSummary = () => {
    const balance = getBalance();
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    const formattedBalance = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance);
    const formattedIncome = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income);
    const formattedExpenses = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expenses);

    const topCategories = getExpensesByCategory()
      .slice(0, 3)
      .map(c => `${c.name}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value)}`)
      .join(', ');

    const goalsSummary = goals
      .map(g => `${g.name}: ${Math.round((g.currentAmount / g.targetAmount) * 100)}% concluído`)
      .join('; ');

    return `Saldo: ${formattedBalance}. Receitas: ${formattedIncome}. Despesas: ${formattedExpenses}. Principais Categorias: ${topCategories}. Metas: ${goalsSummary}.`;
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        goals,
        categories,
        loading,
        addTransaction: (t) => addTransactionMutation.mutateAsync(t).then(() => { }),
        updateTransaction: (id, fields) => updateTransactionMutation.mutateAsync({ id, fields }).then(() => { }),
        deleteTransaction: (id) => deleteTransactionMutation.mutateAsync(id).then(() => { }),
        addGoal: (g) => addGoalMutation.mutateAsync(g).then(() => { }),
        deleteGoal: (id) => deleteGoalMutation.mutateAsync(id).then(() => { }),
        updateGoal: (id, amount) => updateGoalMutation.mutateAsync({ id, amount }).then(() => { }),
        getTotalIncome,
        getTotalExpenses,
        getBalance,
        getExpensesByCategory,
        getFinancialSummary,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

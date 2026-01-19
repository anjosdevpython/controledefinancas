import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { Transaction, FinancialGoal, Category, Account } from '@/types/finance';
import { defaultCategories } from '@/data/categories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FinanceContextType {
  transactions: Transaction[];
  goals: FinancialGoal[];
  categories: Category[];
  accounts: Account[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>, goalId?: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoal: (id: string, amount: number, subGoalId?: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getTotalIncome: (accountId?: string) => number;
  getTotalExpenses: (accountId?: string) => number;
  getBalance: (accountId?: string) => number;
  getExpensesByCategory: (accountId?: string) => { name: string; value: number; color: string }[];
  getFinancialSummary: () => string;
  exportToPDF: () => void;
  getGoalPrediction: (goalId: string) => { estimatedDate: string; monthlyAverage: number } | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // --- QUERIES ---

  const { data: dbCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const { data, error } = await (supabase.from('categories' as any) as any)
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        return (data as any[]).map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type,
        }));
      } catch (e) {
        return [];
      }
    },
    enabled: !!user,
  });

  const categories = useMemo(() => {
    const combined = [...defaultCategories, ...dbCategories];
    // Remove duplicates by name
    return Array.from(new Map(combined.map(item => [item.name, item])).values());
  }, [dbCategories]);

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const { data, error } = await (supabase.from('accounts' as any) as any)
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        return (data as any[]).map(a => ({
          id: a.id,
          name: a.name,
          type: a.type as any,
          color: a.color,
          balance: Number(a.balance),
        }));
      } catch (e) {
        return [{ id: 'default', name: 'Carteira Principal', type: 'cash', color: '#8B5CF6', balance: 0 }];
      }
    },
    enabled: !!user,
  });

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
        accountId: (t as any).account_id || 'default',
        description: t.description || '',
        paymentMethod: t.payment_method as any,
        category: categories.find(c => c.id === t.category_id) || categories[0],
      }));
    },
    enabled: !!user && !loadingCategories,
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
        icon: g.icon || 'Crosshair',
        color: g.color || '#primary',
        subGoals: (g as any).sub_goals || []
      }));
    },
    enabled: !!user,
  });

  const getGoalPrediction = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;

    const relevantTransactions = transactions.filter(t =>
      (t as any).goal_id === goalId ||
      (t.description?.toLowerCase().includes(goal.name.toLowerCase()))
    );

    if (relevantTransactions.length < 2) return null;

    // Simplified monthly average calculation
    const totalSaved = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthsDiff = Math.max(1, Math.round((new Date().getTime() - new Date(relevantTransactions[relevantTransactions.length - 1].date).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyAverage = totalSaved / monthsDiff;

    if (monthlyAverage <= 0) return null;

    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsToFinish = Math.ceil(remaining / monthlyAverage);

    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsToFinish);

    return {
      estimatedDate: estimatedDate.toISOString().split('T')[0],
      monthlyAverage
    };
  };

  const loading = loadingTransactions || loadingGoals || loadingAccounts || loadingCategories;

  // --- MUTATIONS ---

  const addTransactionMutation = useMutation({
    mutationFn: async ({ transaction, goalId }: { transaction: Omit<Transaction, 'id'>, goalId?: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: transaction.type,
          amount: transaction.amount,
          category_id: transaction.category.id,
          account_id: transaction.accountId,
          date: transaction.date,
          description: transaction.description,
          payment_method: transaction.paymentMethod,
          user_id: user?.id,
          goal_id: goalId // Future proofing schema
        } as any])
        .select();

      if (error) throw error;

      if (goalId) {
        await updateGoalMutation.mutateAsync({ id: goalId, amount: transaction.amount });
      }

      return (data as any[])[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Transação adicionada!');
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
          account_id: fields.accountId,
          date: fields.date,
          description: fields.description,
          payment_method: fields.paymentMethod,
        } as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Transação atualizada!');
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
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Transação excluída.');
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      const { data, error } = await (supabase.from('categories' as any) as any)
        .insert([{
          ...category,
          user_id: user?.id
        }])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      toast.success('Categoria criada!');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('categories' as any) as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      toast.success('Categoria excluída!');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      toast.success('Meta criada!');
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
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, amount, subGoalId }: { id: string, amount: number, subGoalId?: string }) => {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      let newSubGoals = [...(goal.subGoals || [])];
      let newAmount = goal.currentAmount;

      if (subGoalId) {
        newSubGoals = newSubGoals.map(sg => {
          if (sg.id === subGoalId) {
            const updatedAmount = Math.min(sg.currentAmount + amount, sg.targetAmount);
            return { ...sg, currentAmount: updatedAmount, isCompleted: updatedAmount >= sg.targetAmount };
          }
          return sg;
        });
        // Recalculate total amount if using subgoals (optional logic choice)
        // newAmount = newSubGoals.reduce((sum, sg) => sum + sg.currentAmount, 0);
        newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      } else {
        newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      }

      const { error } = await supabase
        .from('goals')
        .update({
          current_amount: newAmount,
          sub_goals: newSubGoals // Future proofing schema
        } as any)
        .eq('id', id);

      if (error) throw error;
      return { goalName: goal.name, addedAmount: amount, newProgress: (newAmount / goal.targetAmount) * 100 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      if (data) {
        // Milestone logic
        const progress = data.newProgress;
        const milestones = [25, 50, 75, 100];
        const achievedMilestone = milestones.find(m => progress >= m && (progress - (data.addedAmount / 100)) < m);

        if (achievedMilestone) {
          addNotification({
            title: achievedMilestone === 100 ? 'Meta Alcançada! 🎊' : 'Grande Progresso! 🚀',
            message: `Você atingiu ${achievedMilestone}% da meta "${data.goalName}"!`,
            type: 'success'
          });
        }
      }
    }
  });

  // --- HELPERS ---

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const title = `Relatório Financeiro - ${new Date().toLocaleDateString('pt-BR')}`;

      doc.setFontSize(20);
      doc.text('Anjos Finanças', 105, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text(title, 105, 25, { align: 'center' });

      const tableData = transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description || 'Sem descrição',
        t.category.name,
        t.type === 'income' ? 'Receita' : 'Despesa',
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        headStyles: { fillColor: [139, 92, 246] }, // Primary color
        body: tableData,
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 40;
      doc.setFontSize(14);
      doc.text(`Saldo Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getBalance())}`, 200, finalY + 15, { align: 'right' });

      doc.save(`relatorio-anjos-${new Date().getTime()}.pdf`);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  const getTotalIncome = (accountId?: string) => {
    return transactions
      .filter(t => t.type === 'income' && (!accountId || t.accountId === accountId))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = (accountId?: string) => {
    return transactions
      .filter(t => t.type === 'expense' && (!accountId || t.accountId === accountId))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = (accountId?: string) => {
    return getTotalIncome(accountId) - getTotalExpenses(accountId);
  };

  const getExpensesByCategory = (accountId?: string) => {
    const expenses = transactions.filter(t => t.type === 'expense' && (!accountId || t.accountId === accountId));
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
        accounts,
        loading,
        addTransaction: (t, goalId) => addTransactionMutation.mutateAsync({ transaction: t, goalId }).then(() => { }),
        updateTransaction: (id, fields) => updateTransactionMutation.mutateAsync({ id, fields }).then(() => { }),
        deleteTransaction: (id) => deleteTransactionMutation.mutateAsync(id).then(() => { }),
        addGoal: (g) => addGoalMutation.mutateAsync(g).then(() => { }),
        deleteGoal: (id) => deleteGoalMutation.mutateAsync(id).then(() => { }),
        updateGoal: (id, amount, subGoalId) => updateGoalMutation.mutateAsync({ id, amount, subGoalId }).then(() => { }),
        addCategory: (c) => addCategoryMutation.mutateAsync(c).then(() => { }),
        updateCategory: (id, c) => ({} as any), // Pending full CRUD
        deleteCategory: (id) => deleteCategoryMutation.mutateAsync(id).then(() => { }),
        getTotalIncome,
        getTotalExpenses,
        getBalance,
        getExpensesByCategory,
        getFinancialSummary,
        exportToPDF,
        getGoalPrediction,
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

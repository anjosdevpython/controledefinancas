import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, FinancialGoal, Category } from '@/types/finance';
import { defaultCategories } from '@/data/categories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [categories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transError) throw transError;

      const formattedTransactions: Transaction[] = (transData || []).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        amount: Number(t.amount),
        date: t.date,
        description: t.description,
        paymentMethod: t.payment_method as any,
        category: defaultCategories.find(c => c.id === t.category_id) || defaultCategories[0],
      }));

      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      const formattedGoals: FinancialGoal[] = (goalsData || []).map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        deadline: g.deadline,
        icon: g.icon,
        color: g.color,
      }));

      setTransactions(formattedTransactions);
      setGoals(formattedGoals);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
      toast.error('Erro ao carregar seus dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setTransactions([]);
      setGoals([]);
    }
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
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

      if (data) {
        const newTransaction: Transaction = {
          ...transaction,
          id: data[0].id,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        toast.success('Transação adicionada!');
        addNotification({
          title: transaction.type === 'income' ? 'Nova Receita' : 'Nova Despesa',
          message: `${transaction.description || 'Sem descrição'}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}`,
          type: 'success'
        });
      }
    } catch (error: any) {
      toast.error('Erro ao salvar transação: ' + error.message);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transação excluída.');
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const updateTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: updatedFields.type,
          amount: updatedFields.amount,
          category_id: updatedFields.category?.id,
          date: updatedFields.date,
          description: updatedFields.description,
          payment_method: updatedFields.paymentMethod,
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        setTransactions(prev =>
          prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t))
        );
        toast.success('Transação atualizada!');
        addNotification({
          title: 'Transação Atualizada',
          message: `Sua transação foi corrigida com sucesso.`,
          type: 'success'
        });
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar transação: ' + error.message);
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id'>) => {
    try {
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

      if (data) {
        const newGoal: FinancialGoal = {
          ...goal,
          id: data[0].id,
        };
        setGoals(prev => [newGoal, ...prev]);
        toast.success('Meta criada com sucesso!');
        addNotification({
          title: 'Nova Meta Financeira',
          message: `O objetivo "${goal.name}" foi criado com sucesso!`,
          type: 'success'
        });
      }
    } catch (error: any) {
      toast.error('Erro ao salvar meta: ' + error.message);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Meta excluída.');
    } catch (error: any) {
      toast.error('Erro ao excluir meta: ' + error.message);
    }
  };

  const updateGoal = async (id: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id);

      if (error) throw error;

      setGoals(prev =>
        prev.map(g => (g.id === id ? { ...g, currentAmount: newAmount } : g))
      );
      addNotification({
        title: 'Progresso na Meta',
        message: `Você guardou ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)} para "${goal.name}"!`,
        type: 'success'
      });
    } catch (error: any) {
      toast.error('Erro ao atualizar meta: ' + error.message);
    }
  };

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
    const topCategories = getExpensesByCategory()
      .slice(0, 3)
      .map(c => `${c.name}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value)}`)
      .join(', ');

    const goalsSummary = goals
      .map(g => `${g.name}: ${Math.round((g.currentAmount / g.targetAmount) * 100)}% concluído`)
      .join('; ');

    return `Saldo: ${balance}. Receitas: ${income}. Despesas: ${expenses}. Principais Categorias: ${topCategories}. Metas: ${goalsSummary}.`;
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        goals,
        categories,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addGoal,
        deleteGoal,
        updateGoal,
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

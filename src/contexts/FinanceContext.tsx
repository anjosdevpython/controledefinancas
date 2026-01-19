import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, FinancialGoal, Category } from '@/types/finance';
import { mockTransactions, mockGoals } from '@/data/mockData';
import { defaultCategories } from '@/data/categories';

interface FinanceContextType {
  transactions: Transaction[];
  goals: FinancialGoal[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateGoal: (id: string, amount: number) => void;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getExpensesByCategory: () => { name: string; value: number; color: string }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [goals, setGoals] = useState<FinancialGoal[]>(mockGoals);
  const [categories] = useState<Category[]>(defaultCategories);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateGoal = (id: string, amount: number) => {
    setGoals(prev =>
      prev.map(g =>
        g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g
      )
    );
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

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        goals,
        categories,
        addTransaction,
        deleteTransaction,
        updateGoal,
        getTotalIncome,
        getTotalExpenses,
        getBalance,
        getExpensesByCategory,
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

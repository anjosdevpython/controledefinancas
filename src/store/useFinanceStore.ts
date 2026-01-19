import { create } from 'zustand';
import { Transaction, Category, FinancialGoal } from '@/types/finance';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    color: string;
}

interface FinanceState {
    searchQuery: string;
    selectedMonth: number | null; // 0-11
    selectedYear: number | null;
    selectedCategoryId: string | null;
    selectedAccountId: string | null;
    achievements: Achievement[];

    setSearchQuery: (query: string) => void;
    setSelectedMonth: (month: number | null) => void;
    setSelectedYear: (year: number | null) => void;
    setSelectedCategoryId: (id: string | null) => void;
    setSelectedAccountId: (id: string | null) => void;
    resetFilters: () => void;
    checkAchievements: (transactions: Transaction[], goals: FinancialGoal[]) => void;
    filterTransactions: (transactions: Transaction[]) => Transaction[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    searchQuery: '',
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    selectedCategoryId: null,
    selectedAccountId: null,
    achievements: [
        { id: '1', title: 'Mês no Azul', description: 'Terminou o mês com saldo positivo', icon: 'Trophy', unlocked: false, color: '#FFD700' },
        { id: '2', title: 'Pau pra toda obra', description: 'Registrou 7 transações', icon: 'Zap', unlocked: false, color: '#A855F7' },
        { id: '3', title: 'Investidor Mirim', description: 'Alcançou sua primeira meta', icon: 'Crosshair', unlocked: false, color: '#22C55E' },
        { id: '4', title: 'Organizado', description: 'Usa o calendário financeiro', icon: 'Calendar', unlocked: true, color: '#3B82F6' },
    ],

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedMonth: (month) => set({ selectedMonth: month }),
    setSelectedYear: (year) => set({ selectedYear: year }),
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
    setSelectedAccountId: (id) => set({ selectedAccountId: id }),

    checkAchievements: (transactions, goals) => {
        const { achievements } = get();
        let updated = false;
        const newAchievements = achievements.map(ach => {
            let unlocked = ach.unlocked;

            if (ach.id === '1') { // Mês no Azul
                const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                if (income > expense && transactions.length > 0) unlocked = true;
            }
            if (ach.id === '2') { // Registrou 7 transações
                if (transactions.length >= 7) unlocked = true;
            }
            if (ach.id === '3') { // Primeira meta
                if (goals.some(g => g.currentAmount >= g.targetAmount)) unlocked = true;
            }

            if (unlocked !== ach.unlocked) updated = true;
            return { ...ach, unlocked };
        });

        if (updated) set({ achievements: newAchievements });
    },

    resetFilters: () => set({
        searchQuery: '',
        selectedMonth: null,
        selectedYear: null,
        selectedCategoryId: null,
        selectedAccountId: null
    }),

    filterTransactions: (transactions) => {
        const { searchQuery, selectedMonth, selectedYear, selectedCategoryId, selectedAccountId } = get();

        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);

            const matchesSearch = !searchQuery ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesMonth = selectedMonth === null || transactionDate.getMonth() === selectedMonth;
            const matchesYear = selectedYear === null || transactionDate.getFullYear() === selectedYear;
            const matchesCategory = !selectedCategoryId || t.category.id === selectedCategoryId;
            const matchesAccount = !selectedAccountId || t.accountId === selectedAccountId;

            return matchesSearch && matchesMonth && matchesYear && matchesCategory && matchesAccount;
        });
    },
}));

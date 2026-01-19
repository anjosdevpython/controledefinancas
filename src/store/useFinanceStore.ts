import { create } from 'zustand';
import { Transaction, Category } from '@/types/finance';

interface FinanceState {
    searchQuery: string;
    selectedMonth: number | null; // 0-11
    selectedYear: number | null;
    selectedCategoryId: string | null;

    setSearchQuery: (query: string) => void;
    setSelectedMonth: (month: number | null) => void;
    setSelectedYear: (year: number | null) => void;
    setSelectedCategoryId: (id: string | null) => void;
    resetFilters: () => void;

    // Helper to filter transactions based on state
    filterTransactions: (transactions: Transaction[]) => Transaction[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    searchQuery: '',
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    selectedCategoryId: null,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedMonth: (month) => set({ selectedMonth: month }),
    setSelectedYear: (year) => set({ selectedYear: year }),
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

    resetFilters: () => set({
        searchQuery: '',
        selectedMonth: null,
        selectedYear: null,
        selectedCategoryId: null
    }),

    filterTransactions: (transactions) => {
        const { searchQuery, selectedMonth, selectedYear, selectedCategoryId } = get();

        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);

            const matchesSearch = !searchQuery ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesMonth = selectedMonth === null || transactionDate.getMonth() === selectedMonth;
            const matchesYear = selectedYear === null || transactionDate.getFullYear() === selectedYear;
            const matchesCategory = !selectedCategoryId || t.category.id === selectedCategoryId;

            return matchesSearch && matchesMonth && matchesYear && matchesCategory;
        });
    },
}));

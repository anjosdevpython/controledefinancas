import { Transaction, FinancialGoal, Category, Account } from '@/types/finance';
import { defaultCategories } from '@/data/categories';

const STORAGE_KEY = 'anjos_guest_data';

interface GuestData {
    transactions: Transaction[];
    goals: FinancialGoal[];
    categories: Category[];
    accounts: Account[];
}

const INITIAL_DATA: GuestData = {
    transactions: [],
    goals: [],
    categories: [],
    accounts: [
        { id: 'default', name: 'Carteira Offline', type: 'cash', color: '#8B5CF6', balance: 0 }
    ]
};

export const localStorageService = {
    getData: (): GuestData => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
            return INITIAL_DATA;
        }
        return JSON.parse(data);
    },

    saveData: (data: GuestData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    // --- Transactions ---
    addTransaction: (transaction: Omit<Transaction, 'id'>) => {
        const data = localStorageService.getData();
        const newTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
            // created_at removed as it might not be in the interface or should map to date
        };
        data.transactions.push(newTransaction);

        // Update account balance
        const accountIndex = data.accounts.findIndex(a => a.id === transaction.accountId);
        if (accountIndex >= 0) {
            const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            data.accounts[accountIndex].balance += amount;
        }

        localStorageService.saveData(data);
        return newTransaction;
    },

    updateTransaction: (id: string, updates: Partial<Transaction>) => {
        const data = localStorageService.getData();
        const index = data.transactions.findIndex(t => t.id === id);
        if (index === -1) return null;

        const oldTransaction = data.transactions[index];
        const newTransaction = { ...oldTransaction, ...updates };

        // Revert old balance effect
        const oldAccountIndex = data.accounts.findIndex(a => a.id === oldTransaction.accountId);
        if (oldAccountIndex >= 0) {
            const oldAmount = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
            data.accounts[oldAccountIndex].balance -= oldAmount;
        }

        // Apply new balance effect
        const newAccountIndex = data.accounts.findIndex(a => a.id === newTransaction.accountId);
        if (newAccountIndex >= 0) {
            const newAmount = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;
            data.accounts[newAccountIndex].balance += newAmount;
        }

        data.transactions[index] = newTransaction;
        localStorageService.saveData(data);
        return newTransaction;
    },

    deleteTransaction: (id: string) => {
        const data = localStorageService.getData();
        const index = data.transactions.findIndex(t => t.id === id);
        if (index === -1) return;

        const transaction = data.transactions[index];

        // Revert balance
        const accountIndex = data.accounts.findIndex(a => a.id === transaction.accountId);
        if (accountIndex >= 0) {
            const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            data.accounts[accountIndex].balance -= amount;
        }

        data.transactions.splice(index, 1);
        localStorageService.saveData(data);
    },

    // --- Goals ---
    addGoal: (goal: Omit<FinancialGoal, 'id'>) => {
        const data = localStorageService.getData();
        const newGoal: FinancialGoal = {
            ...goal,
            id: crypto.randomUUID(),
            currentAmount: 0,
        };
        data.goals.push(newGoal);
        localStorageService.saveData(data);
        return newGoal;
    },

    updateGoal: (id: string, updates: Partial<FinancialGoal>) => {
        const data = localStorageService.getData();
        const index = data.goals.findIndex(g => g.id === id);
        if (index === -1) return;

        data.goals[index] = { ...data.goals[index], ...updates };
        localStorageService.saveData(data);
    },

    deleteGoal: (id: string) => {
        const data = localStorageService.getData();
        data.goals = data.goals.filter(g => g.id !== id);
        localStorageService.saveData(data);
    },

    // --- Categories ---
    getCategories: () => {
        const data = localStorageService.getData();
        return [...defaultCategories, ...data.categories];
    },

    addCategory: (category: Omit<Category, 'id'>) => {
        const data = localStorageService.getData();
        const newCategory = { ...category, id: crypto.randomUUID() };
        data.categories.push(newCategory);
        localStorageService.saveData(data);
        return newCategory;
    },

    // --- Accounts ---
    getAccounts: () => {
        return localStorageService.getData().accounts;
    }
};

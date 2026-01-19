import { useState } from 'react';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { GoalCard } from '@/components/goals/GoalCard';
import { MonthlyChart } from '@/components/stats/MonthlyChart';
import { CategoryBreakdown } from '@/components/stats/CategoryBreakdown';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { AddTransactionSheet } from '@/components/transaction/AddTransactionSheet';
import { AddGoalSheet } from '@/components/goals/AddGoalSheet';
import { Sidebar } from '@/components/layout/Sidebar';
import { useFinance } from '@/contexts/FinanceContext';
import { Crosshair, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/finance';
import { FinancialCalendar } from '@/components/dashboard/FinancialCalendar';




function HomeView() {
  return (
    <div className="space-y-6 px-4 pb-24 pt-4 md:px-8">
      <div className="flex flex-col gap-6">
        <BalanceCard />
        <QuickStats />
      </div>
    </div>
  );
}

function ExtractView({ onEditTransaction }: { onEditTransaction: (t: Transaction) => void }) {
  return (
    <div className="space-y-6 px-4 pb-24 pt-4 md:px-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Extrato</h2>
        <p className="text-muted-foreground">Visualize suas transações e calendário.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-12">
          <RecentTransactions onEdit={onEditTransaction} />
        </div>
        <div className="md:col-span-12">
          <FinancialCalendar />
        </div>
      </div>
    </div>
  );
}

function TipsView() {
  return (
    <div className="space-y-6 px-4 pb-24 pt-4 md:px-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dicas do Anjo</h2>
        <p className="text-muted-foreground">Receba insights personalizados sobre suas finanças.</p>
      </div>
      <div className="w-full">
        <InsightCard />
      </div>
    </div>
  );
}

function StatsView() {
  return (
    <div className="space-y-6 px-4 pb-24 pt-4 md:px-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Estatísticas</h2>
        <p className="text-muted-foreground">Analise sua evolução financeira mensal.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <ExpenseChart />
        </div>
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>
        <div>
          <CategoryBreakdown />
        </div>
      </div>
    </div>
  );
}

function GoalsView({ onAddNew }: { onAddNew: () => void }) {
  const { goals } = useFinance();

  return (
    <div className="space-y-6 px-4 pb-24 pt-4 md:px-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Metas financeiras</h2>
          <p className="text-muted-foreground">Planeje seus objetivos de longo prazo.</p>
        </div>
        <Button onClick={onAddNew} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Nova meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Crosshair className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="text-center text-muted-foreground">
            Você ainda não tem metas.
            <br />
            Crie uma para começar a poupar!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6 px-4 pb-24 pt-4 md:px-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Ajustes</h2>
        <p className="text-muted-foreground">Gerencie sua conta e categorias.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SettingsSection />
        </div>
        <div>
          <CategoryManager />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsAddOpen(true);
  };

  const handleAddTransactionOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setTransactionToEdit(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => setIsAddOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden">
          <Header />
        </div>

        <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'extract' && <ExtractView onEditTransaction={handleEditTransaction} />}
          {activeTab === 'tips' && <TipsView />}
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'goals' && <GoalsView onAddNew={() => setIsGoalOpen(true)} />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        <div className="md:hidden">
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddClick={() => setIsAddOpen(true)}
          />
        </div>
      </div>

      <AddTransactionSheet
        open={isAddOpen}
        onOpenChange={handleAddTransactionOpenChange}
        transactionToEdit={transactionToEdit}
      />
      <AddGoalSheet open={isGoalOpen} onOpenChange={setIsGoalOpen} />
    </div>
  );
}

export default function Index() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

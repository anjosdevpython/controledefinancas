import { useState } from 'react';
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
import { useFinance } from '@/contexts/FinanceContext';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DashboardView() {
  return (
    <div className="space-y-4 px-4 pb-24 pt-4">
      <BalanceCard />
      <QuickStats />
      <InsightCard />
      <ExpenseChart />
      <RecentTransactions />
    </div>
  );
}

function StatsView() {
  return (
    <div className="space-y-4 px-4 pb-24 pt-4">
      <h2 className="text-xl font-bold">Estatísticas</h2>
      <MonthlyChart />
      <CategoryBreakdown />
    </div>
  );
}

function GoalsView() {
  const { goals } = useFinance();

  return (
    <div className="space-y-4 px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Metas financeiras</h2>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          Nova meta
        </Button>
      </div>
      
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Target className="mb-4 h-16 w-16 text-muted-foreground/50" />
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
    <div className="space-y-4 px-4 pb-24 pt-4">
      <h2 className="text-xl font-bold">Ajustes</h2>
      <SettingsSection />
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-lg">
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => setIsAddOpen(true)}
      />
      <AddTransactionSheet open={isAddOpen} onOpenChange={setIsAddOpen} />
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

import { Home, PieChart, Crosshair, Plus, Settings, ListOrdered, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const navItems = [
  { id: 'home', label: 'Início', icon: 'Home', color: '#8B5CF6' },
  { id: 'extract', label: 'Extrato', icon: 'ListOrdered', color: '#3B82F6' },
  { id: 'add', label: 'Adicionar', icon: 'Plus', isAction: true, color: '#FFFFFF' },
  { id: 'tips', label: 'Dicas', icon: 'Sparkles', color: '#EC4899' },
  { id: 'stats', label: 'Estatísticas', icon: 'PieChart', color: '#10B981' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <CategoryIcon icon={item.icon} color="#FFFFFF" size="md" className="bg-transparent" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CategoryIcon icon={item.icon} color={isActive ? '#8B5CF6' : '#6B7280'} size="sm" className="bg-transparent" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

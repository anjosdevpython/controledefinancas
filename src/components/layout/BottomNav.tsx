import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const navItems = [
  { id: 'home', label: 'Início', icon: 'Home', color: '#8B5CF6' },
  { id: 'goals', label: 'Metas', icon: 'Target', color: '#FFD700' },
  { id: 'tutorials', label: 'Ajuda', icon: 'BookOpen', color: '#00BFFF' },
  { id: 'add', label: 'Adicionar', icon: 'PlusCircle', isAction: true, color: '#FFFFFF' },
  { id: 'tips', label: 'Dicas', icon: 'Sparkles', color: '#EC4899' },
  { id: 'stats', label: 'Estatísticas', icon: 'PieChart', color: '#10B981' },
  { id: 'settings', label: 'Perfil', icon: 'User', color: '#A9A9A9' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          if (item.id === 'add') {
            return (
              <div key={item.id} className="relative -top-5">
                <button
                  id="mobile-add-transaction" // Targeted by Driver.js
                  onClick={onAddClick}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  <PlusCircle size={24} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              id={`mobile-${item.id}`} // Targeted by Driver.js
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <CategoryIcon
                icon={item.icon}
                color={activeTab === item.id ? 'currentColor' : item.color}
                size="sm"
                className={cn("bg-transparent p-0 w-auto h-auto", activeTab === item.id && 'opacity-100')}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

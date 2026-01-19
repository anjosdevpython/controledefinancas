import { Home, PieChart, PlusCircle, Settings, Target, TrendingUp, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onAddClick: () => void;
}

export function Sidebar({ activeTab, onTabChange, onAddClick }: SidebarProps) {
    const menuItems = [
        { id: 'home', icon: 'Home', label: 'Início', color: '#8B5CF6' },
        { id: 'extract', icon: 'ListOrdered', label: 'Extrato', color: '#3B82F6' },
        { id: 'stats', icon: 'PieChart', label: 'Estatísticas', color: '#10B981' },
        { id: 'goals', icon: 'Crosshair', label: 'Metas', color: '#F59E0B' },
        { id: 'tips', icon: 'Sparkles', label: 'Dicas', color: '#EC4899' },
        { id: 'settings', icon: 'Settings', label: 'Ajustes', color: '#6B7280' },
        { id: 'tutorials', icon: 'BookOpen', label: 'Ajuda', color: '#6B7280' },
    ];

    return (
        <aside className="hidden h-screen w-64 flex-col glass border-r-0 md:flex">
            <div className="flex h-20 items-center gap-3 px-6">
                <img src="/logo.png" alt="Anjos Finanças" className="h-10 w-10 rounded-xl" />
                <span className="text-xl font-bold tracking-tight">Anjos Finanças</span>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        id={`sidebar-${item.id}`} // Targeted by Driver.js
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all',
                            activeTab === item.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                    >
                        <CategoryIcon icon={item.icon} color={activeTab === item.id ? '#FFFFFF' : item.color} size="sm" className="bg-transparent" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="px-4 py-6">
                <button
                    id="sidebar-add-transaction" // Targeted by Driver.js
                    onClick={onAddClick}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <PlusCircle className="h-6 w-6" />
                    <span>Nova Transação</span>
                </button>
            </div>

            <div className="px-6 py-6 transition-opacity hover:opacity-100 opacity-60">
                <a
                    href="https://wa.me/5541984196060"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 rounded-lg border border-border/50 bg-secondary/30 p-3 text-center transition-all hover:bg-secondary/50 hover:shadow-sm"
                >
                    <span className="text-xs font-medium text-primary">Precisa de ajuda?</span>
                    <span className="text-[10px] text-muted-foreground">Falar no WhatsApp</span>
                </a>
            </div>
        </aside>
    );
}

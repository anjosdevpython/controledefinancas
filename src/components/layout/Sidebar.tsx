import { Home, PieChart, Target, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onAddClick: () => void;
}

export function Sidebar({ activeTab, onTabChange, onAddClick }: SidebarProps) {
    const menuItems = [
        { id: 'home', icon: Home, label: 'Início' },
        { id: 'stats', icon: PieChart, label: 'Estatísticas' },
        { id: 'goals', icon: Target, label: 'Metas' },
        { id: 'settings', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl md:flex">
            <div className="flex h-20 items-center gap-3 px-6">
                <img src="/logo.png" alt="Anjos Finanças" className="h-10 w-10 rounded-xl" />
                <span className="text-xl font-bold tracking-tight">Anjos Finanças</span>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all',
                            activeTab === item.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="px-4 py-6">
                <button
                    onClick={onAddClick}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="h-6 w-6" />
                    <span>Nova Transação</span>
                </button>
            </div>

            <div className="px-6 py-6 transition-opacity hover:opacity-100 opacity-60">
                <p className="text-xs text-muted-foreground">© 2026 Anjos Finanças</p>
            </div>
        </aside>
    );
}

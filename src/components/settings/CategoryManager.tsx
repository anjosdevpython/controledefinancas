import { useState } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/FinanceContext';
import { Category } from '@/types/finance';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

// Icons candidates for financial categories
const iconOptions = [
    'ShoppingBag', 'Utensils', 'Car', 'Home', 'Heart',
    'GraduationCap', 'Gamepad2', 'CreditCard', 'Wallet',
    'TrendingUp', 'Laptop', 'PlusCircle', 'Gift', 'Coffee',
    'Plane', 'Lightbulb', 'Music', 'Stethoscope'
];

const colorOptions = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
    '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
];

export function CategoryManager() {
    const { categories, addCategory, deleteCategory } = useFinance();
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('PlusCircle');
    const [newColor, setNewColor] = useState('#8B5CF6');
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');

    // Filter out default categories for management
    // For now we manage all, but user can only delete their own
    const userCategories = categories.filter(c => !['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(c.id));

    const handleCreate = async () => {
        if (!newName.trim()) return;
        await addCategory({
            name: newName,
            icon: newIcon,
            color: newColor,
            type: newType
        });
        setNewName('');
        setShowAdd(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suas Categorias</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
                    {showAdd ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {showAdd ? 'Cancelar' : 'Nova'}
                </Button>
            </div>

            {showAdd && (
                <div className="bg-card border rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <Label>Nome da Categoria</Label>
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Ex: Assinaturas, Academia..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setNewType('expense')}
                            className={cn(
                                "py-2 rounded-xl text-xs font-bold transition-all",
                                newType === 'expense' ? "bg-expense text-white" : "bg-secondary text-muted-foreground"
                            )}
                        >
                            Despesa
                        </button>
                        <button
                            onClick={() => setNewType('income')}
                            className={cn(
                                "py-2 rounded-xl text-xs font-bold transition-all",
                                newType === 'income' ? "bg-income text-white" : "bg-secondary text-muted-foreground"
                            )}
                        >
                            Receita
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Ícone</Label>
                        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
                            {iconOptions.map(iconName => {
                                const Icon = (LucideIcons as any)[iconName];
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => setNewIcon(iconName)}
                                        className={cn(
                                            "flex items-center justify-center h-10 w-10 rounded-lg transition-all",
                                            newIcon === iconName ? "bg-primary text-white" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Cor</Label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewColor(color)}
                                    className={cn(
                                        "h-8 w-8 rounded-full transition-all ring-offset-2",
                                        newColor === color ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <Button className="w-full font-bold h-12 rounded-xl shadow-lg" onClick={handleCreate}>
                        <Check className="h-5 w-5 mr-2" />
                        Criar Categoria
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-2">
                {userCategories.length === 0 ? (
                    <p className="text-center py-8 text-xs text-muted-foreground italic bg-secondary/20 rounded-2xl border border-dashed">
                        Nenhuma categoria personalizada criada ainda.
                    </p>
                ) : (
                    userCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-card border rounded-2xl animate-in fade-in slide-in-from-left duration-300">
                            <div className="flex items-center gap-3">
                                <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{cat.name}</span>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                        {cat.type === 'income' ? 'Receita' : 'Despesa'}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => deleteCategory(cat.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

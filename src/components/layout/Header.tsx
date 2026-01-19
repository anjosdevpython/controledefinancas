import { Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/formatters';
import { useTheme } from '@/hooks/useTheme';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Anjos Finanças Logo" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <p className="text-sm text-muted-foreground">{greeting} 👋</p>
            <h1 className="text-lg font-bold tracking-tight">Anjos Finanças</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>
        </div>
      </div>
    </header>
  );
}

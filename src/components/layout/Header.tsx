import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/formatters';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [showGreeting, setShowGreeting] = useState(true);
  const greeting = getGreeting();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Anjos Finanças Logo" className="h-10 w-10 rounded-lg object-contain" />
          <div className="flex flex-col justify-center">
            <div
              className={`overflow-hidden transition-all duration-1000 ease-in-out ${showGreeting
                ? 'max-h-6 opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 -translate-y-2'
                }`}
            >
              <p className="text-xs font-medium text-primary animate-in fade-in slide-in-from-top-2 duration-1000">
                {greeting} 👋
              </p>
            </div>
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
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}

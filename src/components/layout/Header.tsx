import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, LogOut, WifiOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/formatters';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Badge } from '@/components/ui/badge';

import { AchievementBadges } from '@/components/dashboard/AchievementBadges';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { unreadCount, markAllAsRead } = useNotifications();
  const { exportToPDF } = useFinance();
  const [showGreeting, setShowGreeting] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const greeting = getGreeting();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 4000); // 4 seconds

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-b-0">
      {isOffline && (
        <div className="bg-destructive/10 border-b border-destructive/20 py-1.5 px-4 text-center animate-in slide-in-from-top duration-300">
          <p className="text-[10px] font-bold text-destructive flex items-center justify-center gap-1.5 uppercase tracking-widest">
            <WifiOff className="h-3 w-3 animate-pulse" />
            Você está offline. Suas alterações serão enviadas quando a conexão voltar.
          </p>
        </div>
      )}
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

        <div className="hidden sm:block">
          <AchievementBadges />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={exportToPDF} title="Gerar Relatório PDF">
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={markAllAsRead}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-destructive animate-in zoom-in" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}

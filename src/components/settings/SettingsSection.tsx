import { ChevronRight, Moon, Sun, User, Shield, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

function SettingItem({ icon, title, description, action, onClick, destructive }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-secondary/50 ${destructive ? 'group' : ''}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${destructive ? 'bg-destructive/10 group-hover:bg-destructive/20' : 'bg-secondary'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${destructive ? 'text-destructive' : ''}`}>{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action || <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </button>
  );
}

export function SettingsSection() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleNotImplemented = (feature: string) => {
    toast.info(`${feature} será implementado em breve!`);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="divide-y divide-border/50 p-2">
          <SettingItem
            icon={<User className="h-5 w-5 text-primary" />}
            title="Minha conta"
            description={user?.email || 'Editar perfil'}
            onClick={() => toast.success(`Logado como: ${user?.email}`)}
          />
          <SettingItem
            icon={theme === 'dark' ? <Moon className="h-5 w-5 text-blue-400" /> : <Sun className="h-5 w-5 text-orange-400" />}
            title="Tema escuro"
            description="Ativar modo noturno"
            action={
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            }
            onClick={toggleTheme}
          />
          <SettingItem
            icon={<Bell className="h-5 w-5 text-muted-foreground" />}
            title="Notificações"
            description="Gerenciar alertas"
            onClick={() => handleNotImplemented('Notificações')}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="divide-y divide-border/50 p-2">
          <SettingItem
            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
            title="Segurança"
            description="Senha e autenticação"
            onClick={() => handleNotImplemented('Configurações de Segurança')}
          />
          <SettingItem
            icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
            title="Ajuda e suporte"
            description="Perguntas frequentes"
            onClick={() => handleNotImplemented('Central de Ajuda')}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-destructive/20 bg-destructive/5">
        <CardContent className="p-2">
          <SettingItem
            icon={<LogOut className="h-5 w-5 text-destructive" />}
            title="Sair da conta"
            description="Desconectar do app"
            onClick={() => {
              signOut();
              toast.success('Você saiu com sucesso!');
            }}
            destructive
          />
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-1 py-4">
        <p className="text-center text-xs text-muted-foreground">
          Anjos Finanças v1.1.0 • O seu controle financeiro
        </p>
        <div className="h-1 w-12 rounded-full bg-border/50" />
      </div>
    </div>
  );
}

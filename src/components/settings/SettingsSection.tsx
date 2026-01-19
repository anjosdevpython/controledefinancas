import { ChevronRight, Moon, Sun, User, Shield, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

function SettingItem({ icon, title, description, action, onClick }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-secondary/50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
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

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="divide-y divide-border p-2">
          <SettingItem
            icon={<User className="h-5 w-5 text-muted-foreground" />}
            title="Minha conta"
            description="Editar perfil e preferências"
          />
          <SettingItem
            icon={theme === 'dark' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
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
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="divide-y divide-border p-2">
          <SettingItem
            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
            title="Segurança"
            description="Senha e autenticação"
          />
          <SettingItem
            icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
            title="Ajuda e suporte"
            description="Perguntas frequentes"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-2">
          <SettingItem
            icon={<LogOut className="h-5 w-5 text-destructive" />}
            title="Sair da conta"
            description="Desconectar do app"
          />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        FinançasPro v1.0.0 • Feito com ❤️
      </p>
    </div>
  );
}

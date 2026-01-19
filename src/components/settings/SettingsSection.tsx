import { useState } from 'react';
import { ChevronRight, Moon, Sun, User, Shield, Bell, HelpCircle, LogOut, Key, Mail, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

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
  const { user, signOut, resetPassword } = useAuth();
  const [showSecurity, setShowSecurity] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      toast.success('E-mail de redefinição enviado!');
      setShowSecurity(false);
    } catch (error) {
      toast.error('Erro ao enviar e-mail.');
    }
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
            icon={<Bell className="h-5 w-5 text-green-500" />}
            title="Notificações"
            description="Alertas do sistema"
            action={
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            }
            onClick={() => setNotifications(!notifications)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="divide-y divide-border/50 p-2">
          <SettingItem
            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
            title="Segurança"
            description="Senha e autenticação"
            onClick={() => setShowSecurity(true)}
          />
          <SettingItem
            icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
            title="Ajuda e suporte"
            description="Dúvidas e contato"
            onClick={() => setShowHelp(true)}
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
          Anjos Finanças v1.2.0 • Inteligência Financeira
        </p>
        <div className="h-1 w-12 rounded-full bg-border/50" />
      </div>

      {/* Security Dialog */}
      <Dialog open={showSecurity} onOpenChange={setShowSecurity}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Segurança
            </DialogTitle>
            <DialogDescription>
              Gerencie a segurança da sua conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Trocar Senha</p>
                  <p className="text-xs text-muted-foreground">Enviaremos um link para {user?.email}</p>
                </div>
              </div>
              <Button onClick={handleResetPassword} className="w-full" variant="outline">
                Solicitar Nova Senha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Suporte
            </DialogTitle>
            <DialogDescription>
              Como podemos ajudar você?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Como adicionar metas?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vá até a aba "Metas" e clique em "Nova Meta". Você pode definir o valor e o prazo para seu objetivo.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Os dados são seguros?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sim! Usamos criptografia de ponta a ponta via Supabase. Somente você tem acesso aos seus registros financeiros.
                </p>
              </div>
              <div className="pt-4">
                <Button className="w-full gap-2" variant="secondary">
                  <Mail className="h-4 w-4" />
                  Falar com suporte via E-mail
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

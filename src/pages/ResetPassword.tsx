import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            // Check for errors in the URL hash (e.g., otp_expired)
            const hash = window.location.hash;
            if (hash.includes('error=')) {
                const params = new URLSearchParams(hash.replace('#', '?'));
                const errorDesc = params.get('error_description');
                if (errorDesc) {
                    toast.error(`Link inválido: ${errorDesc.replace(/\+/g, ' ')}`);
                    setCheckingSession(false);
                    setTimeout(() => navigate('/auth'), 3000);
                    return;
                }
            }

            // Check if we have an active session (recovery link signs user in)
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error('Sessão de recuperação não encontrada. Solicite um novo link.');
                setTimeout(() => navigate('/auth'), 2000);
            }
            setCheckingSession(false);
        };

        checkSession();
    }, [navigate]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            toast.success('Senha atualizada com sucesso!');
            // Log out user for them to sign in with new password
            await supabase.auth.signOut();
            navigate('/auth');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar senha');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center">
                    <img src="/logo.png" alt="Anjos Finanças Logo" className="h-16 w-16 rounded-2xl shadow-xl" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Nova Senha
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Escolha uma senha forte para sua segurança.
                    </p>
                </div>

                <Card className="border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Redefinir Senha</CardTitle>
                        <CardDescription>
                            Crie uma nova senha de acesso.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleResetPassword}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full group" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Atualizar Senha
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

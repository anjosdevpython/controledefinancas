import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { session } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (session) {
            navigate('/');
        }
    }, [session, navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                toast.success('Link de recuperação enviado para seu e-mail!');
                setIsForgotPassword(false);
            } else if (isSignUp) {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                if (data?.session) {
                    toast.success('Conta criada e logada!');
                    navigate('/');
                } else {
                    toast.success('Cadastro realizado!');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Bem-vindo de volta!');
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (isForgotPassword) return 'Recuperar senha';
        return isSignUp ? 'Criar sua conta' : 'Acesse o Anjos Finanças';
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center">
                    <img src="/logo.png" alt="Anjos Finanças Logo" className="h-16 w-16 rounded-2xl shadow-xl transition-transform hover:scale-110" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        {getTitle()}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isForgotPassword ? 'Enviaremos um link para seu e-mail' : 'O seu controle financeiro com asas para crescer.'}
                    </p>
                </div>

                <Card className="border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>{isForgotPassword ? 'Recuperação' : (isSignUp ? 'Cadastro' : 'Login')}</CardTitle>
                        <CardDescription>
                            {isForgotPassword
                                ? 'Insira o e-mail da sua conta'
                                : (isSignUp ? 'Preencha os dados para começar' : 'Insira suas credenciais para continuar')}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleAuth}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {!isForgotPassword && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Senha</Label>
                                        {!isSignUp && (
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="h-auto p-0 text-xs text-primary"
                                                onClick={() => setIsForgotPassword(true)}
                                            >
                                                Esqueceu a senha?
                                            </Button>
                                        )}
                                    </div>
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
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full group" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        {isForgotPassword ? 'Enviar Link' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                className="w-full text-sm"
                                onClick={() => {
                                    if (isForgotPassword) {
                                        setIsForgotPassword(false);
                                    } else {
                                        setIsSignUp(!isSignUp);
                                    }
                                }}
                            >
                                {isForgotPassword
                                    ? 'Voltar para o Login'
                                    : (isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se')}
                            </Button>
                        </CardFooter>
                    </form>

                </Card>
            </div>
        </div>
    );
}

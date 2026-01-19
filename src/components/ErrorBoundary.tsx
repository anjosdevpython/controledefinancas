import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                    <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Algo deu errado</h1>
                    <p className="mb-6 text-muted-foreground max-w-md">
                        Desculpe, ocorreu um erro inesperado. Tente recarregar a página.
                    </p>
                    <div className="mb-6 rounded-md bg-muted p-4 text-left font-mono text-sm overflow-auto max-w-full">
                        {this.state.error?.message}
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Recarregar Página
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

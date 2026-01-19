import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'Anjos Finanças';

        switch (path) {
            case '/':
                title = 'Dashboard - Anjos Finanças';
                break;
            case '/auth':
                title = 'Login - Anjos Finanças';
                break;
            case '/reset-password':
                title = 'Recuperar Senha - Anjos Finanças';
                break;
            default:
                title = 'Anjos Finanças - Controle Inteligente';
        }

        document.title = title;
    }, [location]);
}

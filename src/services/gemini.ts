const GEMINI_MODEL = 'gemini-1.5-flash';

export async function getGeminiFinancialTip(financialData: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === '...' || apiKey.includes('SUA_CHAVE')) {
        console.error('Gemini API Key is missing or invalid');
        return 'Chave de API do Gemini não configurada. Adicione VITE_GEMINI_API_KEY às variáveis de ambiente do seu projeto (Vercel/Netlify).';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const prompt = `
    Você é um assistente financeiro inteligente e motivador chamado "Anjo Financeiro".
    Analise os seguintes dados financeiros de um usuário e forneça uma dica única, curta e acionável para hoje.
    
    Dados do usuário:
    ${financialData}
    
    Regras:
    1. A resposta deve ter no máximo 3 frases.
    2. Seja específico sobre onde economizar ou como atingir uma meta.
    3. Use um tom encorajador.
    4. Responda em Português do Brasil.
    
    Dica:
  `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Details:', errorData);
            throw new Error(`Erro ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Resposta da IA em formato inesperado.');
    } catch (error: any) {
        console.error('Error fetching Gemini tip:', error);
        return `Ops! O Anjo Financeiro teve um problema: ${error.message}. Verifique a chave da API.`;
    }
}

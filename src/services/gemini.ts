const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

export async function getGeminiFinancialTip(financialData: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.error('Gemini API Key is missing');
        return 'Configure sua chave de API para receber dicas personalizadas.';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error fetching Gemini tip:', error);
        return 'Não foi possível gerar uma dica personalizada no momento. Continue focado em suas metas!';
    }
}

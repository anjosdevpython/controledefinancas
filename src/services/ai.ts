const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function getAIFinancialTip(financialData: string): Promise<string> {
    if (!OPENAI_API_KEY) {
        console.error('OpenAI API Key is missing');
        return 'Chave de API não configurada. Adicione VITE_OPENAI_API_KEY às variáveis de ambiente.';
    }

    const prompt = `
    Você é um assistente financeiro inteligente e motivador chamado "Anjo Financeiro".
    Analise os seguintes dados financeiros de um usuário e forneça uma dica única, curta e acionável para hoje.
    
    Dados do usuário:
    ${financialData}
    
    Regras:
    1. A resposta deve ter no máximo 3 frases.
    2. Seja específico sobre onde economizar ou como atingir uma meta.
    3. Use um tom encorajador e profissional.
    4. Responda em Português do Brasil.
  `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Using 3.5-turbo for speed and compatibility, can be gpt-4o-mini
                messages: [
                    { role: 'system', content: 'Você é um assistente financeiro útil.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API Details:', errorData);
            throw new Error(`Erro OpenAI ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error('Error fetching OpenAI tip:', error);
        return `Ops! O Anjo Financeiro teve um problema: ${error.message}. Verifique a conta da OpenAI.`;
    }
}

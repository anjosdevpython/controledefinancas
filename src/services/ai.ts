const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// Não usar fallback com chave fixa para evitar vazamento de segredo.
const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY;

async function fetchWithFallback(payload: any, isVision: boolean = false): Promise<any> {
    const configs = [
        {
            name: 'OpenAI',
            url: 'https://api.openai.com/v1/chat/completions',
            key: OPENAI_API_KEY,
            model: isVision ? 'gpt-4o-mini' : 'gpt-4o-mini'
        },
        {
            name: 'xAI (Grok)',
            url: 'https://api.x.ai/v1/chat/completions',
            key: XAI_API_KEY,
            model: isVision ? 'grok-vision-preview' : 'grok-beta'
        }
    ];

    let lastError = null;

    for (const config of configs) {
        if (!config.key) continue;

        try {
            // Adjust payload for xAI if needed (they are mostly compatible)
            const body = { ...payload, model: config.model };

            const response = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.key}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                console.log(`Successfully used ${config.name}`);
                return await response.json();
            }

            const errorData = await response.json().catch(() => ({}));
            lastError = new Error(`${config.name} Error: ${errorData?.error?.message || response.statusText}`);
            console.warn(lastError.message);
        } catch (e: any) {
            lastError = e;
            console.warn(`Failed to call ${config.name}:`, e.message);
        }
    }

    throw lastError || new Error('All AI services failed or no API keys configured.');
}

export async function getAIFinancialTip(financialData: string): Promise<string> {
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
        const data = await fetchWithFallback({
            messages: [
                { role: 'system', content: 'Você é um assistente financeiro útil.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        return data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error('Error fetching AI tip:', error);
        return `Ops! O Anjo Financeiro teve um problema: ${error.message}.`;
    }
}

export async function scanReceipt(base64Image: string): Promise<{
    amount: number,
    date: string,
    description: string,
    categoryName: string
} | null> {
    try {
        const data = await fetchWithFallback({
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this receipt image and return ONLY a JSON object with the following fields: amount (number), date (YYYY-MM-DD), description (short string), and suggested categoryName (one of: Lazer, Casa, Alimentação, Saúde, Transporte, Salário, Educação, Outros). If date is missing, use today. Only return the JSON, nothing else.' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        }, true);

        const content = data.choices[0].message.content;
        return JSON.parse(content.replace(/```json|```/g, '').trim());
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
}

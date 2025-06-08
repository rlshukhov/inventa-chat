import { getApiKey, getSelectedModel } from '@/data/chatDatabase.ts';

export const fetchResponseStream = async (
    messages: { role: string; content: string }[],
    provider: 'gpt' | 'deepseek' = 'gpt',
    onUpdate: (partial: string) => void, // callback with partial response
    abortController?: AbortController
): Promise<void> => {
    const apiKey = await getApiKey(provider);
    const model = await getSelectedModel(provider);

    if (!apiKey) throw new Error(`API key not found for provider "${provider}"`);
    if (!model) throw new Error(`Model not selected for provider "${provider}"`);

    const baseURL = provider === 'gpt'
        ? 'https://api.openai.com/v1'
        : 'https://api.deepseek.com/v1';

    const url = `${baseURL}/chat/completions`;

    const requestBody = {
        model,
        messages,
        stream: true,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: abortController?.signal
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    // Processing the stream response body
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');

    let partialResponse = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
        for (const line of lines) {
            const dataStr = line.replace(/^data: /, '').trim();
            if (dataStr === '[DONE]') {
                break;
            }
            try {
                const data = JSON.parse(dataStr);
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) {
                    partialResponse += delta;
                    onUpdate(partialResponse);
                }
            } catch (e) {
                // ignore parse errors for incomplete chunks
            }
        }
    }
};
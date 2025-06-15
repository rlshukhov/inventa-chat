import {getApiKey, getSelectedModel} from '@/data/chatDatabase.ts';

export type ProviderRaw = 'perplexity' | 'deepseek' | 'gpt';

export interface Provider {
    label: string;
    value: ProviderRaw;
}

export interface Model {
    id: string;
    provider: ProviderRaw;
}

export const providers: Array<Provider> = [
    { label: 'ChatGPT', value: 'gpt' },
    { label: 'DeepSeek', value: 'deepseek' },
    { label: 'Perplexity', value: 'perplexity' },
]

export const models: Array<Model> = [
    { id: 'gpt-4.1-mini', provider: 'gpt' },
    { id: 'gpt-4.1-nano', provider: 'gpt' },
    { id: 'deepseek-chat', provider: 'deepseek' },
    { id: 'deepseek-reasoner', provider: 'deepseek' },
    { id: 'sonar', provider: 'perplexity' },
    { id: 'sonar-pro', provider: 'perplexity' },
]

const format = function (provider: ProviderRaw, text: string, links: string[] | null = null): string {
    if (provider !== 'perplexity') {
        return text;
    }

    let newText = text.replace(/\[(\d+)]/g, (_, group) => ` [^${group}]`);

    if (links && links.length > 0) {
        let linkIndex = 0;
        newText += '\n\n' + links.map(() => {
            const link = links[linkIndex++];
            return `[^${linkIndex}]: ${link}`;
        }).join('\n');
    }

    return newText;
};

export const fetchResponseStream = async (
    messages: { role: string; content: string }[],
    onUpdate: (partial: string, model: Model) => void, // callback with partial response
    abortController?: AbortController
): Promise<void> => {
    const model = await getSelectedModel();
    if (!model) throw new Error(`Model not selected`);

    const apiKey = await getApiKey(model?.provider)
    if (!apiKey) throw new Error(`API key not found for provider "${model.provider}"`);

    const baseURL = model.provider === 'gpt'
        ? 'https://api.openai.com/v1'
        : (model.provider === 'deepseek' ? 'https://api.deepseek.com/v1' : 'https://api.perplexity.ai');

    const url = `${baseURL}/chat/completions`;

    const requestBody = {
        model: model.id,
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
        const {done, value} = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, {stream: true});

        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
        for (const line of lines) {
            const dataStr = line.replace(/^data: /, '').trim();
            if (dataStr === '[DONE]') {
                break;
            }
            try {
                const data = JSON.parse(dataStr);
                if (data.choices?.[0]?.message) {
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        onUpdate(format(model.provider, content, data.citations), model);
                    }
                } else {
                    const delta = data.choices?.[0]?.delta?.content;
                    if (delta) {
                        partialResponse += delta;
                        onUpdate(format(model.provider, partialResponse), model);
                    }
                }
            } catch (e) {
                // ignore parse errors for incomplete chunks
            }
        }
    }
};
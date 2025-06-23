import {type Provider, providersByName} from "@/models/ai/providers.ts";
import type {Model} from "@/models/ai/models.ts";
import type {Message} from "@/models/ai/messages.ts";
import {eventBus} from "@/eventBus.ts";

export const streamChatCompletion = async (
    model: Model,
    messages: Message[],
    onUpdate: (partial: string) => void,
    abortController?: AbortController,
): Promise<void> => {
    const provider: Provider = providersByName[model.providerName] ?? null;
    if (!provider) {
        throw new Error(`Provider "${model.providerName}" not found`);
    }

    if (!await provider.isAvailable()) {
        throw new Error(`Provider "${model.providerName}" is not available`);
    }

    eventBus.emit('aiModelUsed', model);

    const url = `${provider.api.baseURL}${provider.api.chatCompletionUrl}`;
    const requestBody = {
        model: model.id,
        messages,
        stream: true,
    };

    const headers: Record<string, string> = await provider.api.buildHeaders(provider.storage);
    headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        signal: abortController?.signal,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');

    let partialResponse = '';

    const formatter = provider.outputFormatter ?? ((content: string) => content);

    while (true) {
        const {done, value} = await reader.read();
        if (done) {
            break;
        }
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
                        onUpdate(formatter(content, data));
                    }
                } else {
                    const delta = data.choices?.[0]?.delta?.content;
                    if (delta) {
                        partialResponse += delta;
                        onUpdate(formatter(partialResponse, data));
                    }
                }
            } catch {
                // ignore parse errors for incomplete chunks
            }
        }
    }
};
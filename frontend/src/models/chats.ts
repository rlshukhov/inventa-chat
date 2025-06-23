import {type Message, type MessageRole} from '@/models/ai/messages.ts';

export interface ChatMessage extends Message {
    id: string;
    dialogueId: string;
    role: MessageRole;
    content: string;
    timestamp: number;
    modelUid?: string;
    replyToMessageId?: string;
    isTyping: boolean;
}

export interface Dialogue {
    id: string;
    title: string;
    timestamp: number;
    messages: ChatMessage[];
}
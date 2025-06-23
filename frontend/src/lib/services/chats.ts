import Dexie, {type Table} from 'dexie';
import type {ChatMessage, Dialogue} from '@/models/chats.ts';
import type {MessageRole} from "@/models/ai/messages.ts";

export class ChatsStorage extends Dexie {
    private dialogues!: Table<Omit<Dialogue, 'messages'>, string>;
    private messages!: Table<ChatMessage, string>;

    constructor() {
        super('ChatsStorage');
        this.version(1).stores({
            dialogues: 'id, title, timestamp',
            messages: 'id, dialogueId, timestamp',
        });
    }

    public createDialogue(title: string): Dialogue {
        return new class implements Dialogue {
            id: string = crypto.randomUUID();
            title: string;
            timestamp = Date.now();
            messages = [];

            constructor(title: string) {
                this.title = title;
            }
        }(title);
    }

    public createMessage(dialogueId: string, role: MessageRole, content: string, modelUid?: string, replyToMessageId?: string, isTyping: boolean = false): ChatMessage {
        return new class implements ChatMessage {
            id: string = crypto.randomUUID();
            dialogueId: string;
            role: MessageRole;
            content: string;
            timestamp: number = Date.now();
            modelUid?: string;
            replyToMessageId?: string;
            isTyping: boolean;

            constructor(dialogueId: string, role: MessageRole, content: string, modelUid: string | undefined = undefined, replyToMessageId: string | undefined = undefined, isTyping: boolean = false) {
                this.dialogueId = dialogueId;
                this.role = role;
                this.content = content;
                this.timestamp = Date.now();
                this.modelUid = modelUid;
                this.replyToMessageId = replyToMessageId;
                this.isTyping = isTyping;
            }
        }(dialogueId, role, content, modelUid, replyToMessageId, isTyping);
    }

    public async storeDialogue(dialogue: Omit<Dialogue, 'messages'>): Promise<void> {
        await this.dialogues.put(dialogue);
    }

    public async deleteDialogue(dialogueId: string): Promise<void> {
        await this.dialogues.delete(dialogueId);
        await this.messages.where('dialogueId').equals(dialogueId).delete();
    }

    public async storeMessage(message: ChatMessage): Promise<void> {
        await this.messages.put(message);
    }

    public async drop(): Promise<void> {
        await this.dialogues.clear();
        await this.messages.clear();
    }

    public async deleteMessage(messageId: string): Promise<void> {
        await this.messages.delete(messageId);
    }

    public async getDialogues(): Promise<Omit<Dialogue, 'messages'>[]> {
        return this.dialogues.toArray();
    }

    public async getDialogueWithMessages(dialogueId: string): Promise<Dialogue | null> {
        const dialogue = await this.dialogues.get(dialogueId);
        if (!dialogue) {
            return null;
        }

        const messages = await this.messages.where('dialogueId').equals(dialogueId).toArray();
        return {...dialogue, messages};
    }
}

export const chatsStorage: ChatsStorage = new ChatsStorage();

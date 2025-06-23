import mitt from 'mitt';
import type {Model} from "@/models/ai/models.ts";

type Events = {
    settingsUpdate: null
    aiModelUsed: Model
};

export const eventBus = mitt<Events>();

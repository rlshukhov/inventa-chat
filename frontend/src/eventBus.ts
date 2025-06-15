import mitt from 'mitt';
import type {Model} from "@/aiService.ts";

type Events = {
    selectedModelUpdate: Model;
    settingsUpdate: null
};

export const eventBus = mitt<Events>();

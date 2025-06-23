import type {ProviderID} from "@/models/ai/providers.ts";

export interface ModelDefinition {
    id: string;
    providerName: ProviderID;
    title: string|null;
}

export class Model implements ModelDefinition {
    id: string;
    providerName: ProviderID;
    title: string|null;

    constructor(providerName: ProviderID, id: string, title: string|null = null) {
        this.providerName = providerName;
        this.id = id;
        this.title = title;
    }

    get uid(): string {
        return `${this.providerName}:${this.id}`;
    }
}

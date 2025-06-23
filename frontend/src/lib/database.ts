import Dexie from "dexie";

interface KeyValue<ValueT = any> {
    key: string;
    value: ValueT;
}

export abstract class KeyValueDatabase<ValueT = any> extends Dexie {
    protected keyValues!: Dexie.Table<KeyValue<ValueT>, string>;

    protected constructor(name: string) {
        super(name);
        this.version(1).stores({
            keyValues: 'key',
        });
    }

    protected async get(key: string): Promise<ValueT | null> {
        const item = await this.keyValues.get(key);
        return item ? item.value : null;
    }

    protected async set(key: string, value: ValueT): Promise<void> {
        await this.keyValues.put({key, value});
    }
}
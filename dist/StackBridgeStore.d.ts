import { Observable } from "rxjs";
export interface SBStoreConfig {
    name: string;
    dbName: string;
    tableName: string;
    indexes: Array<string>;
}
export declare class StackBridgeStore {
    private store;
    private indexes;
    private storeStream;
    config: SBStoreConfig;
    constructor(config: SBStoreConfig);
    loadStore(data: any[]): void;
    getAll(): Observable<any[]>;
    get(id: string): Observable<any>;
    getByIndex(key: string, value: any): Observable<any>;
    save(data: any): void;
    performChanges(cdata: {
        new_val: any;
        old_val: any;
    }): void;
    reIndex(): void;
}

import { SBConnectInitConfig } from "./StackBridgeConnecter";
import { SBStoreConfig } from "./StackBridgeStore";
import { Observable } from "rxjs";
export interface StackBridgeConfig {
    ServerOption: SBConnectInitConfig;
    StoreOptions: SBStoreConfig[];
}
export declare class StackBridge {
    private stores;
    private config;
    private connector;
    private connection;
    constructor(config: StackBridgeConfig);
    getAllfromStore(storeName: string): Observable<any[]>;
    getFromStore(storeName: string, id: string): Observable<any>;
    getFromStoreByIndex(storeName: string, index: string, value: any): Observable<any>;
    InsertInStore(storeName: string, value: any): void;
    updateInStore(storeName: string, value: any): void;
}

/// <reference types="socket.io-client" />
import { Observable } from 'rxjs';
import { SBConnection } from './SBConnection';
import { RequestTranslator } from './RequestTranslator';
export interface sbInitConfig {
    hostname: string;
    port: number;
    namespace: string;
    AuthToken?: string;
}
export declare class StackBridge {
    private config;
    socket: SocketIOClient.Socket;
    token: string;
    conn: Observable<SBConnection>;
    constructor();
    connect(config: sbInitConfig): Observable<SBConnection>;
    setToken(token: any): void;
    createRequest(): RequestTranslator;
}

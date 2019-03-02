/// <reference types="socket.io-client" />
import { Observable } from 'rxjs';
import { SBConnection } from './SBConnection';
import { RequestTranslator } from './RequestTranslator';
export interface SBConnectInitConfig {
    hostname: string;
    port: number;
    namespace: string;
    AuthToken?: string;
}
export declare class StackBridgeConnecter {
    private config;
    socket: SocketIOClient.Socket;
    token: string;
    conn: Observable<SBConnection>;
    constructor();
    connect(config: SBConnectInitConfig): Observable<SBConnection>;
    setToken(token: string): void;
    createRequest(): RequestTranslator;
}

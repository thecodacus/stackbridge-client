/// <reference types="socket.io-client" />
import { Subject, Observable } from "rxjs";
import { operation } from "./RequestTranslator";
export interface SBChannel {
    cursor: Subject<any>;
    id: string;
}
export declare class SBConnection {
    private socket;
    private conn;
    private auth;
    private closed;
    private token;
    constructor(socket: SocketIOClient.Socket, token?: string);
    runRequest(request: Array<operation>, connetable?: boolean): Observable<SBChannel>;
    _setupChannel(channelId: string): SBChannel;
    createChangeFeed(source: SBChannel, change: SBChannel): SBChannel;
    close(): void;
    setToken(token: any): void;
    isAuthenticated(): Observable<any>;
}

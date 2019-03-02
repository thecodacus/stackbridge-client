import { Observable } from "rxjs";
import { SBConnection, SBChannel } from './SBConnection';
export interface operation {
    command: string;
    argumentType: string;
    argument?: any;
}
export declare class RequestTranslator {
    private requestQueue;
    constructor(requestQueue?: Array<operation>);
    db(name: string): RequestTranslator;
    table(name: string): RequestTranslator;
    get(id: string): RequestTranslator;
    pluck(fields: Array<string>): RequestTranslator;
    filter(conditions: any): RequestTranslator;
    orderBy(conditions: any): RequestTranslator;
    skip(value: number): RequestTranslator;
    limit(value: number): RequestTranslator;
    has_fields(value: string): RequestTranslator;
    count(): RequestTranslator;
    distinct(): RequestTranslator;
    insert(value: any): RequestTranslator;
    update(value: any): RequestTranslator;
    delete(): RequestTranslator;
    changes(): RequestTranslator;
    run(conn: SBConnection, trackChanges?: boolean): Observable<SBChannel>;
}

import { switchMap, map, tap } from "rxjs/operators";
var RequestTranslator = /** @class */ (function () {
    function RequestTranslator(requestQueue) {
        if (requestQueue === void 0) { requestQueue = null; }
        if (requestQueue) {
            this.requestQueue = Object.assign([], requestQueue);
        }
        else {
            this.requestQueue = [];
        }
    }
    RequestTranslator.prototype.db = function (name) {
        this.requestQueue.push({
            command: 'db',
            argumentType: 'value',
            argument: name
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.table = function (name) {
        this.requestQueue.push({
            command: 'table',
            argumentType: 'value',
            argument: name
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.get = function (id) {
        this.requestQueue.push({
            command: 'get',
            argumentType: 'value',
            argument: id
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.pluck = function (fields) {
        this.requestQueue.push({
            command: 'pluck',
            argumentType: 'value',
            argument: fields
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.filter = function (conditions) {
        this.requestQueue.push({
            command: 'filter',
            argumentType: 'value',
            argument: conditions
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.orderBy = function (conditions) {
        this.requestQueue.push({
            command: 'orderBy',
            argumentType: 'value',
            argument: conditions
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.skip = function (value) {
        this.requestQueue.push({
            command: 'skip',
            argumentType: 'value',
            argument: value
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.limit = function (value) {
        this.requestQueue.push({
            command: 'limit',
            argumentType: 'value',
            argument: value
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.has_fields = function (value) {
        this.requestQueue.push({
            command: 'has_fields',
            argumentType: 'value',
            argument: value
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.count = function () {
        this.requestQueue.push({
            command: 'count',
            argumentType: 'none',
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.distinct = function () {
        this.requestQueue.push({
            command: 'distinct',
            argumentType: 'none',
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    // Insert query
    RequestTranslator.prototype.insert = function (value) {
        this.requestQueue.push({
            command: 'insert',
            argumentType: 'value',
            argument: JSON.parse(JSON.stringify(value))
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    // update query
    RequestTranslator.prototype.update = function (value) {
        this.requestQueue.push({
            command: 'update',
            argumentType: 'value',
            argument: value
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    // delete query
    RequestTranslator.prototype.delete = function () {
        this.requestQueue.push({
            command: 'delete',
            argumentType: 'none',
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.changes = function () {
        this.requestQueue.push({
            command: 'changes',
            argumentType: 'none',
        });
        return new RequestTranslator(Object.assign([], this.requestQueue));
    };
    RequestTranslator.prototype.run = function (conn, trackChanges) {
        if (trackChanges === void 0) { trackChanges = false; }
        if (trackChanges) {
            var chReq = new RequestTranslator(Object.assign([], this.requestQueue));
            var src = conn.runRequest(this.requestQueue, true);
            var ch_1 = conn.runRequest(chReq.changes().requestQueue, true);
            var ret = src.pipe(tap(function (data) {
                console.log(data);
            }), switchMap(function (initChannel) {
                var ret = ch_1.pipe(tap(function (data) { return console.log(data); }), map(function (cChannel) {
                    return conn.createChangeFeed(initChannel, cChannel);
                }));
                //(ch as ConnectableObservable<BBChannel>).connect();
                return ret;
            }));
            src.connect();
            ch_1.connect();
            return ret;
        }
        else {
            return conn.runRequest(this.requestQueue);
        }
    };
    return RequestTranslator;
}());
export { RequestTranslator };
//# sourceMappingURL=RequestTranslator.js.map
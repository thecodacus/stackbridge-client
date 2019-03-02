import { StackBridgeStore } from ".";
import { StackBridgeConnecter } from ".";
import { Subject } from "rxjs";
import { switchMap, multicast } from "rxjs/operators";
var StackBridge = /** @class */ (function () {
    function StackBridge(config) {
        var _this = this;
        this.stores = {};
        this.config = config;
        this.connector = new StackBridgeConnecter();
        this.connection = this.connector.connect(this.config.ServerOption)
            .pipe(multicast(new Subject()));
        this.config.StoreOptions.forEach(function (options) {
            _this.stores[options.name] = new StackBridgeStore(options);
            _this.connection.pipe(switchMap(function (conn) {
                return _this.connector.createRequest()
                    .db(options.dbName)
                    .table(options.name)
                    .run(conn);
            }), switchMap(function (channel) { return channel.cursor; })).subscribe(function (data) { return _this.stores[options.name].loadStore(data); });
            _this.connection.pipe(switchMap(function (conn) {
                return _this.connector.createRequest()
                    .db(options.dbName)
                    .table(options.name)
                    .changes()
                    .run(conn);
            }), switchMap(function (channel) { return channel.cursor; })).subscribe(function (data) { return _this.stores[options.name].performChanges(data); });
        });
        this.connection.connect();
    }
    StackBridge.prototype.getAllfromStore = function (storeName) {
        return this.stores[storeName].getAll();
    };
    StackBridge.prototype.getFromStore = function (storeName, id) {
        return this.stores[storeName].get(id);
    };
    StackBridge.prototype.getFromStoreByIndex = function (storeName, index, value) {
        return this.stores[storeName].getByIndex(index, value);
    };
    return StackBridge;
}());
export { StackBridge };
//# sourceMappingURL=StackBridge.js.map
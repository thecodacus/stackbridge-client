import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
var StackBridgeStore = /** @class */ (function () {
    function StackBridgeStore(config) {
        this.config = config;
        this.indexes = {};
        this.store = {};
        this.storeStream = new BehaviorSubject({});
    }
    StackBridgeStore.prototype.loadStore = function (data) {
        var _this = this;
        this.store = {};
        data.forEach(function (item) { _this.store[item['id']] = item; });
        this.reIndex();
    };
    StackBridgeStore.prototype.getAll = function () {
        return this.storeStream.pipe(map(function (indexes) { return Object.keys(indexes["id"]).map(function (key) { return indexes["id"][key]; }); }));
    };
    StackBridgeStore.prototype.get = function (id) {
        return this.storeStream.pipe(map(function (indexes) { return indexes['id'][id]; }));
    };
    StackBridgeStore.prototype.getByIndex = function (key, value) {
        var idx = this.indexes[key];
        if (!idx)
            throw "index with key: " + key + " does not exist";
        return this.storeStream.pipe(map(function (indexes) { return indexes[key][value]; }));
    };
    StackBridgeStore.prototype.save = function (data) {
        //this.store[data.id]=data;
    };
    StackBridgeStore.prototype.performChanges = function (cdata) {
        if (!cdata.new_val && !cdata.old_val) { }
        else if (!cdata.new_val && cdata.old_val) {
            // delete operation
            delete this.store[cdata.old_val.id];
        }
        else if (!cdata.old_val && cdata.new_val) {
            // insert new item
            this.store[cdata.new_val.id] = cdata.new_val;
        }
        else {
            this.store[cdata.new_val.id] = cdata.new_val;
        }
        this.reIndex();
    };
    StackBridgeStore.prototype.reIndex = function () {
        var _this = this;
        this.indexes = {};
        this.indexes['id'] = {};
        this.config.indexes.forEach(function (index) {
            _this.indexes[index] = {};
            Object.keys(_this.store).map(function (key) {
                var idx = _this.store[key][index];
                if (idx)
                    _this.indexes[index][idx] = _this.store[key];
                return;
            });
        });
        this.indexes['id'] = this.store;
        this.storeStream.next(this.indexes);
    };
    return StackBridgeStore;
}());
export { StackBridgeStore };
//# sourceMappingURL=StackBridgeStore.js.map
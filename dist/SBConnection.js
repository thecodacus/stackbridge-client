import { Subject, Observable, BehaviorSubject } from "rxjs";
import { map, tap, multicast, switchMap, scan, startWith, shareReplay } from "rxjs/operators";
var SBConnection = /** @class */ (function () {
    function SBConnection(socket, token) {
        if (token === void 0) { token = null; }
        this.socket = socket;
        this.conn = this._setupChannel('request');
        this.auth = this._setupChannel('auth');
        this.closed = false;
        this.token = token;
    }
    SBConnection.prototype.runRequest = function (request, connetable) {
        var _this = this;
        if (connetable === void 0) { connetable = false; }
        if (this.closed) {
            throw Error("Backbone Connection Is Closed");
        }
        var ob = new Observable(function (observer) {
            _this.conn.cursor.next({ request: request, token: _this.token, callback: function (_a) {
                    var error = _a.error, channelId = _a.data;
                    if (error) {
                        observer.error(error);
                    }
                    else {
                        console.log("new channel=> " + channelId);
                        var channel = _this._setupChannel(channelId);
                        observer.next(channel);
                        observer.complete();
                    }
                } });
        });
        if (connetable)
            return ob.pipe(multicast(new Subject()));
        else
            return ob;
    };
    SBConnection.prototype._setupChannel = function (channelId) {
        var _this = this;
        var sub = new BehaviorSubject([]);
        new Observable(function (observar) {
            _this.socket.on(channelId, function (data) { return observar.next(data); });
            return function () {
                console.log("removing listener");
                _this.socket.removeEventListener(channelId);
            };
        }).pipe(map(function (res) {
            if (res.error)
                throw (res.error);
            return res.data;
        }), shareReplay(1)).subscribe(function (data) { return sub.next(data); });
        // We define our Observer which will listen to messages
        // from our other components and send messages back to our
        // socket server whenever the `next()` method is called.
        var observer = {
            next: function (data) {
                _this.socket.emit(channelId, { request: data.request, token: _this.token }, data.callback);
            },
        };
        // we return our Rx.Subject which is a combination
        // of both an observer and observable.
        return { cursor: Subject.create(observer, sub), id: channelId };
    };
    SBConnection.prototype.createChangeFeed = function (source, change) {
        var _this = this;
        console.log("creating feed channel");
        var updatedFeed = source.cursor.pipe(tap(function (data) { return console.log(data); }), switchMap(function (src) { return change.cursor.pipe(startWith({ new_val: null, old_val: null }), scan(function (sdata, cdata) {
            if (!cdata.new_val && !cdata.old_val) { }
            else if (!cdata.new_val && cdata.old_val) {
                // delete operation
                var i = sdata.findIndex(function (item) { return item.id == cdata.old_val.id; });
                if (i >= 0) {
                    sdata.splice(i, 1);
                }
                ;
            }
            else if (!cdata.old_val && cdata.new_val) {
                // insert new item
                sdata.push(cdata.new_val);
            }
            else {
                //change new item
                var i = sdata.findIndex(function (item) { return item.id == cdata.old_val.id; });
                if (i >= 0) {
                    sdata[i] = cdata.new_val;
                }
                else {
                    sdata.push(cdata.new_val);
                }
                ;
            }
            return sdata;
        }, src)); }));
        var observer = {
            next: function (res) {
                _this.socket.emit(source.id, res.data, res.callback);
                _this.socket.emit(change.id, res.data, res.callback);
            }
        };
        var trackFeed = updatedFeed;
        var changeCursor = Subject.create(observer, trackFeed);
        return { cursor: changeCursor, id: change.id };
    };
    SBConnection.prototype.close = function () {
        this.conn.cursor.complete();
        this.closed = true;
    };
    SBConnection.prototype.setToken = function (token) {
        this.token = token;
    };
    SBConnection.prototype.isAuthenticated = function () {
        this.auth.cursor.next({});
        return this.auth.cursor.asObservable();
    };
    return SBConnection;
}());
export { SBConnection };
//# sourceMappingURL=SBConnection.js.map
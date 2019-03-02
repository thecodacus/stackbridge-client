import { Subject, Observable , BehaviorSubject } from "rxjs";
import { operation } from "./RequestTranslator";
import { map, tap, multicast, switchMap, scan, startWith, shareReplay } from "rxjs/operators";

export interface SBChannel{
  cursor:Subject<any>,
  id:string
}
export class SBConnection{
  private socket: SocketIOClient.Socket;
  private conn:SBChannel;
  private auth:SBChannel;
  private closed:boolean;
  private token:string;
  constructor(socket:SocketIOClient.Socket,token:string=null){
    this.socket=socket;
    this.conn=this._setupChannel('request');
    this.auth=this._setupChannel('auth');
    this.closed=false;
    this.token=token;
  }
  runRequest(request:Array<operation>,connetable:boolean=false):Observable<SBChannel>{
    if(this.closed){throw Error("Backbone Connection Is Closed")}

    let ob=new Observable<SBChannel>((observer)=>{
      this.conn.cursor.next({request:request,token:this.token,callback:({error:error,data:channelId})=>{
        if(error){observer.error(error)}
        else{
          console.log("new channel=> "+channelId)
          let channel=this._setupChannel(channelId);
          observer.next(channel);
          observer.complete();
        }
      }});
    });
    if(connetable) return ob.pipe(multicast(new Subject<SBChannel>()))
    else return ob;
  }
  _setupChannel(channelId:string):SBChannel{
    let sub=new BehaviorSubject([]);
    new Observable(observar=>{
      this.socket.on(channelId,(data)=>observar.next(data))
      return ()=>{
        console.log("removing listener");
        this.socket.removeEventListener(channelId);
      };
    }).pipe(
      map((res:any)=>{
        if(res.error) throw(res.error)
        return res.data
      }),
      shareReplay(1)
    ).subscribe(data=>sub.next(data))
    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    let observer = {
        next: (data:any) => {
            this.socket.emit(channelId, {request:data.request,token:this.token},data.callback);
        },
    };

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return { cursor:Subject.create(observer, sub), id:channelId}
  }
  createChangeFeed(source:SBChannel,change:SBChannel):SBChannel{
    console.log("creating feed channel")
    let updatedFeed=source.cursor.pipe(
      tap(data=>console.log(data)),
      switchMap((src)=>change.cursor.pipe(
          startWith({new_val:null,old_val:null}),
          scan((sdata:any[],cdata:{new_val:any,old_val:any})=>{
            if(!cdata.new_val && !cdata.old_val){}
            else if(!cdata.new_val && cdata.old_val){
              // delete operation
              let i=sdata.findIndex(item=>item.id==cdata.old_val.id);
              if(i>=0){
                sdata.splice(i,1);
              };
            }
            else if(!cdata.old_val && cdata.new_val){
              // insert new item
              sdata.push(cdata.new_val);
            }
            else{
              //change new item
              let i=sdata.findIndex(item=>item.id==cdata.old_val.id);
              if(i>=0){
                sdata[i]=cdata.new_val;
              }
              else{
                sdata.push(cdata.new_val);
              };
            }
            return sdata;
          },src),

      )),
    )
    let observer={
      next: (res) => {
          this.socket.emit(source.id, res.data,res.callback);
          this.socket.emit(change.id, res.data,res.callback);
      }
    }
    let trackFeed:Observable<any[]>=updatedFeed;
    let changeCursor:Subject<any[]>=Subject.create(observer,trackFeed);
    return {cursor:changeCursor,id:change.id};
  }
  close(){
    this.conn.cursor.complete();
    this.closed=true;
  }
  setToken(token){
    this.token=token;
  }
  isAuthenticated(){
    this.auth.cursor.next({});
    return this.auth.cursor.asObservable();
  }
}

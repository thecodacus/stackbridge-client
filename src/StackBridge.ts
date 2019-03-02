import * as io from 'socket.io-client';
import { Observable, Subject ,race} from 'rxjs';
import { SBConnection, SBChannel } from './SBConnection';
import { RequestTranslator } from './RequestTranslator';
import { switchMap, map, merge, concat, tap, expand, share } from 'rxjs/operators';

export interface sbInitConfig{
  hostname:string,
  port:number,
  namespace:string,
  AuthToken?:string
}

export class StackBridge{
  private config:sbInitConfig;
  socket: SocketIOClient.Socket;
  token:string;
  conn:Observable<SBConnection>;
  constructor(){}
  connect(config:sbInitConfig):Observable<SBConnection>{
    this.config=config;
    let ob=new Observable<SBConnection>((observer)=>{
      this.socket=io(this.config.hostname+":"+this.config.port+"/"+this.config.namespace);
      this.socket.on('connect',()=>{
        console.log("connection established!!")
        this.socket.emit('init',{token:this.config.AuthToken},(err,result)=>{
          if(err){
            this.socket.disconnect();
            observer.error(err);
            observer.complete();
            console.log(err);
            return;
          }else{
            observer.next(new SBConnection(this.socket,this.token));
            return
          }
        });
      })
    }).pipe(share());
    return ob;
  }
  setToken(token){
    this.token=token;
    if(this.conn){
      this.conn.subscribe(conn=>{
        conn.setToken(this.token);
      })
    }
  }
  createRequest():RequestTranslator{
    return new RequestTranslator();
  }

}

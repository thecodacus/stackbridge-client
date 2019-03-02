import {SBConnectInitConfig,StackBridgeConnecter } from "./StackBridgeConnecter";
import {StackBridgeStore,SBStoreConfig} from "./StackBridgeStore"
import {SBConnection} from "./SBConnection"
import { Observable, Subject, ConnectableObservable } from "rxjs";
import { switchMap, multicast } from "rxjs/operators";
export interface StackBridgeConfig{
  ServerOption:SBConnectInitConfig,
  StoreOptions:SBStoreConfig[]
}
export class StackBridge{
  private stores:{[id:string]:StackBridgeStore}={};
  private config:StackBridgeConfig;
  private connector:StackBridgeConnecter;
  private connection:Observable<SBConnection>
  constructor(config:StackBridgeConfig){
    this.config=config;
    this.connector=new StackBridgeConnecter();
    this.connection=this.connector.connect(this.config.ServerOption)
      .pipe(multicast(new Subject()));
    this.config.StoreOptions.forEach(options=>{
      this.stores[options.name]=new StackBridgeStore(options);
      this.connection.pipe(
        switchMap(conn=>
          this.connector.createRequest()
          .db(options.dbName)
          .table(options.name)
          .run(conn)
        ),
        switchMap(channel=>channel.cursor)
      ).subscribe(data=>this.stores[options.name].loadStore(data))
      this.connection.pipe(
        switchMap(conn=>
          this.connector.createRequest()
          .db(options.dbName)
          .table(options.name)
          .changes()
          .run(conn)
        ),
        switchMap(channel=>channel.cursor)
      ).subscribe(data=>this.stores[options.name].performChanges(data))
    });
    (this.connection as ConnectableObservable<SBConnection>).connect()
  }
  getAllfromStore(storeName:string):Observable<any[]>{
    return this.stores[storeName].getAll();
  }
  getFromStore(storeName:string,id:string):Observable<any>{
    return this.stores[storeName].get(id);
  }
  getFromStoreByIndex(storeName:string,index:string,value:any):Observable<any>{
    return this.stores[storeName].getByIndex(index,value);
  }
  InsertInStore(storeName:string,value:any){
    this.connection.toPromise().then(conn=>{

    })
  }
  updateInStore(storeName:string,value:any){

  }
}

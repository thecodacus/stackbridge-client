import { Observable, fromEvent, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
export interface SBStoreConfig{
  name:string,
  dbName:string,
  tableName:string,
  indexes:Array<string>
}
export class StackBridgeStore{
  private store:{[id:string]:any};
  private indexes:{[id:string]:{[id:string]:any}};
  private storeStream:BehaviorSubject<{[id:string]:{[id:string]:any}}>
  config: SBStoreConfig;
  constructor(config:SBStoreConfig){
    this.config=config;
  }
  loadStore(data:any[]){
    this.store={}
    data.forEach(item=>{this.store[item['id']]=item});
    this.reIndex();
  }
  getAll():Observable<any[]>{
    return this.storeStream.pipe(
      map(indexes=>Object.keys(indexes["id"]).map(key=>indexes["id"][key]))
    );
  }
  get(id:string):Observable<any>{
    return this.storeStream.pipe(
      map(indexes=>indexes['id'][id])
    );
  }
  getByIndex(key:string,value){
    let idx=this.indexes[key]
    if(!idx) throw `index with key: ${key} does not exist`;
    return this.storeStream.pipe(
      map(indexes=>indexes[key][value])
    );
  }
  save(data:any){
    //this.store[data.id]=data;
  }
  performChanges(cdata:{new_val:any,old_val:any}){
    if(!cdata.new_val && !cdata.old_val){}
    else if(!cdata.new_val && cdata.old_val){
      // delete operation
      delete this.store[cdata.old_val.id]
    }
    else if(!cdata.old_val && cdata.new_val){
      // insert new item
      this.store[cdata.new_val.id]=cdata.new_val;
    }
    else{
      this.store[cdata.new_val.id]=cdata.new_val;
    }
    this.reIndex()
  }
  reIndex(){
    this.indexes={}
    this.config.indexes.forEach(index=>{
      Object.keys(this.store).map(key=>{
        let idx=this.store[key][index]
        if(idx)this.indexes[index][idx]=this.store[key]
        return
      });
    });
    this.indexes['id']=this.store;
    this.storeStream.next(this.indexes);
  }
}

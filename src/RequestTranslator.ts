import { Subject, Observable, ConnectableObservable } from "rxjs";
import { SBConnection, SBChannel } from './SBConnection';
import { switchMap, map, multicast, share, tap } from "rxjs/operators";
export interface operation{
  command:string,
  argumentType:string,
  argument?:any
}

export class RequestTranslator{
  private requestQueue:Array<operation>;
  constructor(requestQueue:Array<operation>=null){
    if(requestQueue){
      this.requestQueue=Object.assign([],requestQueue);
    }
    else{
      this.requestQueue=[];
    }
  }
  db(name:string):RequestTranslator{
    this.requestQueue.push({
      command:'db',
      argumentType:'value',
      argument:name
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  table(name:string):RequestTranslator{
    this.requestQueue.push({
      command:'table',
      argumentType:'value',
      argument:name
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  get(id:string):RequestTranslator{
    this.requestQueue.push({
      command:'get',
      argumentType:'value',
      argument:id
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  pluck(fields:Array<string>):RequestTranslator{
    this.requestQueue.push({
      command:'pluck',
      argumentType:'value',
      argument:fields
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  filter(conditions:any):RequestTranslator{
    this.requestQueue.push({
      command:'filter',
      argumentType:'value',
      argument:conditions
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  orderBy(conditions:any):RequestTranslator{
    this.requestQueue.push({
      command:'orderBy',
      argumentType:'value',
      argument:conditions
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  skip(value:number):RequestTranslator{
    this.requestQueue.push({
      command:'skip',
      argumentType:'value',
      argument:value
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  limit(value:number):RequestTranslator{
    this.requestQueue.push({
      command:'limit',
      argumentType:'value',
      argument:value
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  has_fields(value:string){
    this.requestQueue.push({
      command:'has_fields',
      argumentType:'value',
      argument:value
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  count():RequestTranslator{
    this.requestQueue.push({
      command:'count',
      argumentType:'none',
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  distinct():RequestTranslator{
    this.requestQueue.push({
      command:'distinct',
      argumentType:'none',
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  // Insert query
  insert(value:any):RequestTranslator{
    this.requestQueue.push({
      command:'insert',
      argumentType:'value',
      argument:JSON.parse(JSON.stringify(value))
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  // update query
  update(value:any):RequestTranslator{
    this.requestQueue.push({
      command:'update',
      argumentType:'value',
      argument:value
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  // delete query
  delete():RequestTranslator{
    this.requestQueue.push({
      command:'delete',
      argumentType:'none',
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  changes():RequestTranslator{
    this.requestQueue.push({
      command:'changes',
      argumentType:'none',
    })
    return new RequestTranslator(Object.assign([], this.requestQueue));
  }
  run(conn:SBConnection,trackChanges:boolean=false):Observable<SBChannel>{
    if(trackChanges){
      let chReq=new RequestTranslator(Object.assign([], this.requestQueue));
      let src=conn.runRequest(this.requestQueue,true);
      let ch=conn.runRequest(chReq.changes().requestQueue,true)
      let ret=src.pipe(
        tap(data=>{
          console.log(data);
        }),
        switchMap(initChannel=>{
          let ret=ch.pipe(
              tap(data=>console.log(data)),
              map(cChannel=>{
               return conn.createChangeFeed(initChannel,cChannel)
             })
          );
          //(ch as ConnectableObservable<BBChannel>).connect();
         return ret
       })
     );
     (src as ConnectableObservable<SBChannel>).connect();
     (ch as ConnectableObservable<SBChannel>).connect();
      return ret
    }
    else{
      return conn.runRequest(this.requestQueue);
    }
  }
}

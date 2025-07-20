export interface Beacon {
  id: string;
  slug: string;
  flags: Flag[];
  createdAt: Date;
  updatedAt: Date;
  title:string;
  description:string;
  brandUrl?:string;
  // constructor(){
  //   this.id = '';
  //   this.slug = '';
  //   this.flags = [];    this.createdAt = new Date();
  //   this.updatedAt = new Date();
  // // }
  // updateFlagValue(id:number,value:any):boolean
  // {
  //   var flag=this.flags.find(flag => flag.id === id)
  //   if(!flag)
  //     return false
  //   flag.value = value;
  //   return true;
  // }
  // addFlag(flag:Flag):boolean
  // {

  //   this.flags.push(flag);
  //   return true;
  // }
  // removeFlag(id:number):boolean
  // {
  //   var flag=this.flags.find(flag => flag.id === id)
  //   if(!flag)
  //     return false
  //   this.flags.splice(this.flags.indexOf(flag),1);
  //   return true;
  // }
}

export interface Flag {
  id: number;
  name: string;
  type: FlagType;
  value: any;
  options?: string[]; // For dropdown type - only allowing string options
}
export interface Log{
  updatedAt:Date;
  updatedValue:any;
}

export enum FlagType {
  Boolean = 'boolean',
  String = 'string',
  Number = 'number',
  Counter = 'counter',
  Dropdown = 'dropdown',
  List = 'list'
} 

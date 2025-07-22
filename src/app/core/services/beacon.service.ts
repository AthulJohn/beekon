import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Beacon, Flag, FlagType } from '../models/beacon.model';
import { v4 as uuidv4 } from 'uuid';
import { FlagService } from './flag.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})

export class BeaconService {
  private currentBeacon = new BehaviorSubject<Beacon | null>(null);

  constructor(
    private flagService: FlagService,
    // Inject your SupabaseService here
    private supabaseService: SupabaseService
  ) {}

  // Observable for components to subscribe to beacon changes
  get beacon$(): Observable<Beacon | null> {
    return this.currentBeacon.asObservable();
  }

  /**
   * Get the current beacon
   */
  getBeacon(): Beacon {
    
    if (!this.currentBeacon.value) {
      throw new Error('No beacon loaded');
    }
    return this.currentBeacon.value;
  }  
  getStrictBeacon(): Beacon {
    
    if (!this.currentBeacon.value) {
      throw new Error('No beacon loaded');
    }
    return this.currentBeacon.value;
  }

  /**
   * Create a new beacon with unique ID verification
   */
  async createBeacon(): Promise<Beacon> {
    try {
      // Check if beacon with this slug already exists
      // const exists = await this.checkBeaconExists(slug);
      // if (exists) {
      //   throw new Error(`Beacon with slug '${slug}' already exists`);
      // }

      const newBeacon: Beacon = {
        id: this.generateUniqueId(),
        slug:this.generateUniqueId(),
        flags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        title:'',
        description:''
      };

      this.currentBeacon.next(newBeacon);
      await this.supabaseService.createBeacon(newBeacon);
      return newBeacon;
    } catch (error) {
      console.error('Error creating beacon:', error);
      throw error;
    }
  }

  /**
   * Add a new flag to the current beacon
   */
  addFlag(name: string, type: FlagType,value:any, options?: string[]): void {
    
    const currentBeacon = this.getStrictBeacon();
    const newFlag=  this.flagService.createFlag(currentBeacon.id, name, type,this.generateFlagId(),value, options);
    const updatedBeacon = {
      ...currentBeacon,
      flags: [...currentBeacon.flags, newFlag],
      updatedAt: new Date(Date.now())
    };

    this.currentBeacon.next(updatedBeacon);
  }

  /**
   * Remove a flag from the current beacon
   */
  removeFlag(flagId: number): void {
    const currentBeacon = this.getStrictBeacon();
    if (!currentBeacon) {
      throw new Error('No beacon loaded');
    }

    const updatedBeacon = {
      ...currentBeacon,
      flags: currentBeacon.flags.filter(flag => flag.id !== flagId),
      updatedAt: new Date()
    };

    this.currentBeacon.next(updatedBeacon);
  }

  /**
   * Edit an existing flag
   */
  editFlag(flagId: number, updates: Partial<Omit<Flag, 'id'>>): void {
    const currentBeacon = this.getStrictBeacon();
    if (!currentBeacon) {
      throw new Error('No beacon loaded');
    }

    const flagIndex = currentBeacon.flags.findIndex(flag => flag.id === flagId);
    if (flagIndex === -1) {
      throw new Error(`Flag with ID ${flagId} not found`);
    }

    const updatedFlag=this.flagService.editFlag(currentBeacon.flags[flagIndex], updates);

    // const currentFlag = ;
    const updatedFlags = [...currentBeacon.flags];
    updatedFlags[flagIndex] = updatedFlag;

    const updatedBeacon = {
      ...currentBeacon,
      flags: updatedFlags,
      updatedAt: new Date()
    };

    this.currentBeacon.next(updatedBeacon);
  }

  /**
   * Update a specific flag's value
   */
  updateBeaconFlag(flagId: number, value: any): void {
    const currentBeacon = this.getStrictBeacon();

    const flag = currentBeacon.flags.find(f => f.id === flagId);
    if (!flag) {
      throw new Error(`Flag with ID ${flagId} not found`);
    }

    this.editFlag(flagId, { value: value });
  }
  incrementBeaconFlag(flagId: number, value: number): void {
    const currentBeacon = this.getStrictBeacon();

    const flag = currentBeacon.flags.find(f => f.id === flagId);
    if (!flag) {
      throw new Error(`Flag with ID ${flagId} not found`);
    }
    if(flag.type!= FlagType.Counter && flag.type!=FlagType.Number)
      return;

    this.editFlag(flagId, { value: flag.value+value });
  }
  addToListFlag(id:number,item:string){
    
    const currentBeacon = this.getStrictBeacon();

    const flag = currentBeacon.flags.find(f => f.id === id);
    if (!flag) {
      throw new Error(`Flag with ID ${id} not found`);
    }
    if(flag.type!= FlagType.List)
      return;
    
    this.editFlag(id, { value: [...flag.value,item] });
  }
  removeFromListFlag(id:number,index:number){
    
    const currentBeacon = this.getStrictBeacon();

    const flag = currentBeacon.flags.find(f => f.id === id);
    if (!flag) {
      throw new Error(`Flag with ID ${id} not found`);
    }
    if(flag.type!= FlagType.List)
      return;
    var updatedValue=flag.value.splice(index,1)
    this.editFlag(id, { value: updatedValue });
  }
  /**
   * Save the current beacon to Supabase
   */
  async saveBeacon(): Promise<boolean> {
    const currentBeacon = this.getBeacon();
    if (!currentBeacon) {
      throw new Error('No beacon to save');
    }
    if(currentBeacon.flags.length<1)
    {
      return false;
    }
    try {
      await this.supabaseService.updateBeacon(currentBeacon);
      // Uncomment and implement when SupabaseService is available
      // const exists = await this.checkBeaconExists(currentBeacon.slug, currentBeacon.id);
      // if (exists) {
      //   await this.supabaseService.update('beacons', currentBeacon.id, currentBeacon).toPromise();
      // } else {
      //   await this.supabaseService.insert('beacons', currentBeacon).toPromise();
      // }

      console.log('Beacon saved successfully:', currentBeacon);
    } catch (error) {
      console.error('Error saving beacon:', error);
      throw error;
    }
    return true;
  }
  editDetails(name:string,description:string,url:string){
    
    const currentBeacon = this.getStrictBeacon();
    const updatedBeacon = {
      ...currentBeacon,
      title: name,
      description:description,
      brandUrl:url
    };
    this.currentBeacon.next(updatedBeacon);
  }

  /**
   * Load a beacon from Supabase
   */
  async loadBeacon(beaconId: string):Promise< Observable<Beacon|null>> {
    try {
      var beacon=await this.supabaseService.getBeaconById(beaconId);
      this.currentBeacon.next(beacon);
      // this.flagIdCounter = Math.max(...mockBeacon.flags.map(f => f.id), 0) + 1;
      
      return this.beacon$;
    } catch (error) {
      console.error('Error loading beacon:', error);
      throw error;
    }
  }
  async loadBeaconbySlug(slug: string):Promise< Observable<Beacon|null>> {
    try {
      var beacon=await this.supabaseService.getBeaconBySlug(slug);
      this.currentBeacon.next(beacon);
      // this.flagIdCounter = Math.max(...mockBeacon.flags.map(f => f.id), 0) + 1;
      
      return this.beacon$;
    } catch (error) {
      console.error('Error loading beacon:', error);
      throw error;
    }
  }

  /**
   * Check if a beacon exists (for uniqueness validation)
   */
  private async checkBeaconExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
      // Uncomment and implement when SupabaseService is available
      // const result = await this.supabaseService.select('beacons').toPromise();
      // const beacons = result.data || [];
      // return beacons.some((beacon: Beacon) => 
      //   beacon.slug === slug && (!excludeId || beacon.id !== excludeId)
      // );

      // Mock implementation
      return false;
    } catch (error) {
      console.error('Error checking beacon existence:', error);
      return false;
    }
  }

  /**
   * Generate a unique ID for new beacons
   */
  private generateUniqueId(): string {
    return `${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateFlagId():number{
    const currentBeacon=this.getStrictBeacon();
    return Math.max(...currentBeacon.flags.map(f => f.id))+1;
  }

  /**
   * Validate flag value based on type
   */
  /**
   * Clear the current beacon
   */
  clearBeacon(): void {
    this.currentBeacon.next(null);
  }

  /**
   * Get all flags from the current beacon
   */
  getFlags(): Flag[] {
    const beacon = this.getBeacon();
    return beacon ? beacon.flags : [];
  }

  /**
   * Get a specific flag by ID
   */
  getFlag(flagId: number): Flag | undefined {
    const beacon = this.getBeacon();
    return beacon?.flags.find(flag => flag.id === flagId);
  }
}
// export class BeaconService {
//   private readonly STORAGE_KEY = 'beacons';
//   private beaconsSubject = new BehaviorSubject<Beacon[]>([]);
//   beacons$ = this.beaconsSubject.asObservable();

//   constructor() {
//     this.loadFromStorage();
//   }

//   private loadFromStorage(): void {
//     const stored = localStorage.getItem(this.STORAGE_KEY);
//     if (stored) {
//       try {
//         const beacons = JSON.parse(stored);
//         this.beaconsSubject.next(beacons);
//       } catch (error) {
//         console.error('Error loading beacons from storage:', error);
//         localStorage.removeItem(this.STORAGE_KEY);
//         this.beaconsSubject.next([]);
//       }
//     }
//   }

//   private saveToStorage(beacons: Beacon[]): void {
//     try {
//       localStorage.setItem(this.STORAGE_KEY, JSON.stringify(beacons));
//       this.beaconsSubject.next(beacons.map(beacon => ({
//         ...beacon,
//         createdAt: new Date(beacon.createdAt),
//         updatedAt: new Date(beacon.updatedAt)
//       })));
//     } catch (error) {
//       console.error('Error saving beacons to storage:', error);
//     }
//   }

//   createBeacon(): Beacon {
//     const newBeacon: Beacon = {
//       id: uuidv4(),
//       slug: uuidv4().slice(0, 8),
//       flags: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const beacons = [...this.beaconsSubject.value, newBeacon];
//     this.saveToStorage(beacons);
//     return newBeacon;
//   }

//   getBeacon(id: string): Observable<Beacon | undefined> {
//     return this.beacons$.pipe(
//       map(beacons => beacons.find(b => b.id === id))
//     );
//   }

//   getBeaconBySlug(slug: string): Observable<Beacon | undefined> {
//     return this.beacons$.pipe(
//       map(beacons => beacons.find(b => b.slug === slug))
//     );
//   }

//   updateBeacon(id: string, updates: Partial<Beacon>): void {
//     const beacons = this.beaconsSubject.value.map(beacon => {
//       if (beacon.id === id) {
//         return {
//           ...beacon,
//           ...updates,
//           updatedAt: new Date()
//         };
//       }
//       return beacon;
//     });
//     this.saveToStorage(beacons);
//   }

//   updateBeaconSlug(id: string, newSlug: string): boolean {
//     const exists = this.beaconsSubject.value.some(b => b.slug === newSlug);
//     if (exists) return false;

//     this.updateBeacon(id, { slug: newSlug });
//     return true;
//   }

//   deleteBeacon(id: string): void {
//     const beacons = this.beaconsSubject.value.filter(b => b.id !== id);
//     this.saveToStorage(beacons);
//   }
// }

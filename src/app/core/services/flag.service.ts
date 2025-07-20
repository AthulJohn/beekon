import { Injectable } from '@angular/core';
import { BeaconService } from './beacon.service';
import { Flag, FlagType } from '../models/beacon.model';
import { v4 as uuidv4 } from 'uuid';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FlagService {
  constructor() { }

  createFlag(beaconId: string, name: string, type: FlagType ,id:number,value:any,options?: string[]): Flag {
    const validatedValue = this.validateFlagValue(type,value, options);
    const newFlag: Flag = {
      id: id,
      name,
      type,
      value:value?? this.getDefaultValueForType(type),
      options: type === FlagType.Dropdown ? options : ["NIL"]
    };
    return newFlag;

    // this.beaconService.getBeacon(beaconId).pipe(take(1)).subscribe(beacon => {
    //   if (beacon) {
    //     this.beaconService.updateBeacon(beaconId, {
    //       flags: [...beacon.flags, newFlag]
    //     });
    //   }
    // });
  }

  validateFlagValue(type: FlagType, value: any, options?: string[]): any {
    switch (type) {
      case FlagType.Boolean:
        return Boolean(value);

      case FlagType.String:
        return String(value);

      case FlagType.Number:
      case FlagType.Counter:
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Invalid ${type} value: ${value}`);
        }
        return num;

      case FlagType.Dropdown:
        if (!options || !options.includes(value)) {
          throw new Error(`Invalid dropdown value: ${value}. Must be one of: ${options?.join(', ')}`);
        }
        return value;

      case FlagType.List:
        if (!Array.isArray(value)) {
          throw new Error(`List value must be an array`);
        }
        return value;

      default:
        return value;
    }
  }

  editFlag(flag:Flag, updates: Partial<Flag>): Flag {
    // this.beaconService.getBeacon(beaconId).pipe(take(1)).subscribe(beacon => {
    //   if (beacon) {
    //     const updatedFlags = beacon.flags.map(flag => {
    //       if (flag.id === flagId) {
    //         return { ...flag, ...updates };
    //       }
    //       return flag;
    //     });
    //     this.beaconService.updateBeacon(beaconId, { flags: updatedFlags });
    //   }
    // });
    
    const updatedFlag = { ...flag, ...updates };

    // Validate the updated value if provided
    if (updates.value !== undefined) {
      updatedFlag.value = this.validateFlagValue(
        updatedFlag.type,
        updates.value,
        updatedFlag.options
      );
    }
    return updatedFlag;
  }


  removeFlag(beaconId: string, flagId: number): void {
    // this.beaconService.getBeacon(beaconId).pipe(take(1)).subscribe(beacon => {
    //   if (beacon) {
    //     const updatedFlags = beacon.flags.filter(flag => flag.id !== flagId);
    //     this.beaconService.updateBeacon(beaconId, { flags: updatedFlags });
    //   }
    // });
  }

  private getDefaultValueForType(type: FlagType): any {
    switch (type) {
      case FlagType.Boolean:
        return false;
      case FlagType.String:
        return '';
      case FlagType.Number:
        return 0;
      case FlagType.Dropdown:
        return null;
      case FlagType.List:
        return [];
      default:
        return null;
    }
  }
}

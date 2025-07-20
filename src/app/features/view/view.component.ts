import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BeaconService } from '../../core/services/beacon.service';
import { Beacon, Flag } from '../../core/models/beacon.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  standalone: false
})
export class ViewComponent implements OnInit {
  beacon: Beacon|undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private beaconService: BeaconService
  ) {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.router.navigate(['/home']);
      this.beacon=undefined;
      // this.beacon$ = new Observable<Beacon>();
      return;
    }
    this.loadBeacon(slug);
  }

  ngOnInit() {
    // this.beacon$.subscribe(beacon => {
    //   if (!beacon) {
    //     this.router.navigate(['/']);
    //   }
    // });
  }
  async loadBeacon(slug:string){
    
    await this.beaconService.loadBeaconbySlug(slug);
    this.beacon=this.beaconService.getBeacon();
  }
getFlags(){
  return this.beaconService.getFlags();
}
  getChipColor(flag: Flag): string {
    if (flag.type === 'boolean') {
      return flag.value ? 'primary' : 'warn';
    }
    return '';
  }

  formatValue(flag: Flag): string {
    if (flag.type === 'list') {
      return Array.isArray(flag.value) ? flag.value.join(', ') : String(flag.value);
    }
    return String(flag.value);
  }
}

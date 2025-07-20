import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BeaconService } from '../../core/services/beacon.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent {
  constructor(
    private beaconService: BeaconService,
    private router: Router
  ) {}
  isLoading:boolean=false;
  async createNewBeacon(): Promise<void> {
    this.isLoading=true;
    const newBeacon =await this.beaconService.createBeacon();
    this.router.navigate(['/create', newBeacon.id]);
  }
}

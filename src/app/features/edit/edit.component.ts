import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BeaconService } from '../../core/services/beacon.service';
import { FlagService } from '../../core/services/flag.service';
import { Beacon, Flag, FlagType } from '../../core/models/beacon.model';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: false
})
export class EditComponent implements OnInit, OnDestroy {
  // beacon$: Observable<Beacon | undefined>;
  isFormVisible:boolean=false;
  subscription:Subscription;
  beacon:Beacon|null=null;
  flagForm: FormGroup;
  beaconForm:FormGroup;
  flagTypes = Object.values(FlagType);
  selectedType: FlagType = FlagType.Boolean;
  showOptions = false;
  id:string='';
  private destroy$ = new Subject<void>();
  isEdit=true;
  loading = false; // For Hoist button loader
  initialSlug: string = '';
  private formPatched = false; // Track if form has been patched

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private beaconService: BeaconService,
    private flagService: FlagService,
    private fb: FormBuilder
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.route.data.subscribe((data)=>{
      this.isEdit=data.toString()==='Edit';
    });
    this.id = id || '';
    if (id) {
      this.beaconService.loadBeacon(id);
      // this.beaconService.getBeacon();
      console.log("GotBeacon",this.beaconService.beacon$)
    }
    this.subscription = this.beaconService.beacon$.subscribe((data) => {
      this.beacon = data;
      if (this.beacon && this.beacon.slug) {
        this.initialSlug = this.beacon.slug;
      }
      // // Only patch the form if it hasn't been patched yet, or if the beacon id changes
      // if (this.beacon && (!this.formPatched || this.beacon.id !== this.id)) {
      //   this.beaconForm.patchValue({
      //     name: this.beacon.title,
      //     description: this.beacon.description,
      //     url: this.beacon.brandUrl,
      //     slug: this.beacon.slug
      //   });
      // }
      // console.log('Beacon updated:', this.beacon);
    });
    this.flagForm = this.fb.group({
      name: ['', [Validators.required]],
      type: [FlagType.Boolean, [Validators.required]],
      options: [''],
      initialValue: this.getDefaultValue(FlagType.Boolean)
    });
    this.beaconForm=this.fb.group({
      name:[this.beacon?.title, [Validators.required]],
      description:[this.beacon?.description],
      url:this.beacon?.brandUrl,
      slug:this.beacon?.slug
    })
    
    // this.formPatched = true;
  }

  ngOnInit() {
    // If no id, redirect to home (after Angular init)
    if (!this.id) {
      this.router.navigate(['/']);
      return;
    }
    // Watch for type changes to show/hide options field
    this.flagForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.selectedType = type;
        this.showOptions = type === FlagType.Dropdown;
        
        // Reset initial value when type changes
        this.flagForm.patchValue({ initialValue: this.getDefaultValue(type) });
      });
      this.flagForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.selectedType = type;
        this.showOptions = type === FlagType.Dropdown;
        
        // Reset initial value when type changes
        this.flagForm.patchValue({ initialValue: this.getDefaultValue(type) });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  saveBeaconDetails(){
    const { name, description,url} = this.beaconForm.value;
    this.beaconService.editDetails(name,description,url);
  }
  toggleForm(){
      this.isFormVisible = !this.isFormVisible;
  }
  onSubmit() {
    var beaconId=this.beacon?.id;
    var optionsList=[];
    if(!beaconId)return;
    if (!this.flagForm.valid) return;

    const { name, type, options, initialValue } = this.flagForm.value;
    console.log(name,type,options,initialValue);
    let processedValue: any = initialValue;

    // Process initial value based on type
    switch (type) {
      case FlagType.Boolean:
        processedValue = initialValue ?? false;
        break;
      case FlagType.Number:
      case FlagType.Counter:
        processedValue = Number(initialValue) || 0;
        break;
      case FlagType.List:
        processedValue = initialValue ? initialValue.split(',').map((item: string) => item.trim()).filter(Boolean) : [];
        break;
      case FlagType.Dropdown:
        if (!options) {
          return; // Don't add dropdown flag without options
        }
        optionsList = options.split(',').map((opt: string) => opt.trim()).filter(Boolean);
        if (optionsList.length === 0) {
          return; // Don't add dropdown flag without valid options
        }
        processedValue = optionsList[0]; // Default to first option        
    }

    this.beaconService.addFlag(name, type,processedValue,options);
    this.toggleForm();
    this.resetFlagForm();
  }

  private resetFlagForm() {
    this.flagForm.reset({
      name: '',
      type: FlagType.Boolean,
      options: '',
      initialValue: this.getDefaultValue(FlagType.Boolean)
    });
  }



  removeFlag(beaconId: string, flagId: number) {
    this.beaconService.removeFlag(flagId)
  }

  getDefaultValue(type: FlagType): any {
    switch (type) {
      case FlagType.Boolean:
        return false;
      case FlagType.Number:
        return 0;
      case FlagType.String:
        return '';
      case FlagType.List:
        return '';
      case FlagType.Dropdown:
        return '';
      default:
        return '';
    }
  }

  isHoistDisabled(){    
    const { name, description,url} = this.beaconForm.value;
    return !(this.beacon && this.beacon?.flags.length>0 && name);
  }
  async saveBeacon() {
    // If alias is empty, revert to initial
    if (!this.beaconForm.value.slug && this.initialSlug) {
      this.beaconForm.patchValue({ slug: this.initialSlug });
    }
    this.saveBeaconDetails();
    this.loading = true;
    try {
      var isSaved=await this.beaconService.saveBeacon();
      this.router.navigate(['/update', this.beacon?.id]);
    } finally {
      this.loading = false;
    }
  }
}

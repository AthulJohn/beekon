import { Component, OnInit } from '@angular/core';

import {  ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BeaconService } from '../../core/services/beacon.service';
import { FlagService } from '../../core/services/flag.service';
import { Beacon, Flag, FlagType } from '../../core/models/beacon.model';
import { Observable, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { environment } from '../../shared/env/environment';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
  standalone: false
})

export class UpdateComponent implements OnInit {
  beacon:Beacon|null=null;
  id:string|null=null;
  slugControl: FormControl = new FormControl('');
  viewUrl: string = '';
  isToggled: boolean = false;
  counter: number = 0;
  subscription:Subscription =new Subscription();
  baseUrl:string;
  confirmation = {
    copyUpdate: false,
    copyShare: false,
    share: false,
    save: false
  };
  // @ViewChild('copyBtn', { static: true }) copyBtn!: ElementRef;
  // @ViewChild('title', { static: true }) title!: ElementRef;
  // @ViewChild('description', { static: true }) description!: ElementRef;
  // @ViewChild('newItemInput', { static: true }) newItemInput!: ElementRef;
  // @ViewChild('itemsList', { static: true }) itemsList!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private beaconService: BeaconService,
    private flagService: FlagService
  ) {
    
    this.baseUrl=environment.BASE_URL;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/home']); // Add this line
      return;
    }
    this.id=id;
    if(!this.beacon)
      this.beaconService.loadBeacon(id);
    this.subscription = this.beaconService.beacon$.subscribe((data) => {
      this.beacon = data;
      console.log('Beacon updated:', this.beacon);
    });
  }

  async ngOnInit() {
    // this.beacon$.subscribe(beacon => {
    //   if (beacon) {
    //     this.slugControl.setValue(beacon.slug);
    //     this.updateViewUrl(beacon.slug);
    //   }
    // });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  newFlag: Partial<Flag> = {
    type: FlagType.Boolean,
    name: ''
  };
  get getSlugUrl(): string {
    return this.baseUrl +'view/'+ this.beacon?.slug;
  }
  get getUpdateUrl():string{
    return this.baseUrl+'update/'+this.beacon?.id
  }

  copyToClipboard(text: string, type: 'copyUpdate' | 'copyShare') {
    navigator.clipboard.writeText(text)
      .then(() => {
        this.showConfirmation(type);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  shareText(): void {
    if (navigator.share) {
      navigator.share({
        title: 'Share Beacon Info',
        text: "You can see the Beacon Status for '"+ this.beacon?.title+"' using the link " +this.getSlugUrl+" \nVisit https://beekon.netlify.app to create your own beacon.",
        url: window.location.href
      })
      .then(() => this.showConfirmation('share'))
      .catch(err => console.error('Error sharing text:', err));
    } else {
      this.showConfirmation('share');
    }
  }
  incrementCounter(id:number) {
    this.beaconService.incrementBeaconFlag(id,1);
    // this.saveBeacon();
  }

  decrementCounter(id: number) {
    this.beaconService.incrementBeaconFlag(id,-1);
  }

  addToList(id: number, item: string) {
    if (item.trim()) {
      this.beaconService.addToListFlag(id,item);
    }
  }

  removeFromList(id: number, index: number) {
    this.beaconService.removeFromListFlag(id,index);
  }

  async saveFlags() {
    await this.beaconService.saveBeacon();
    this.showConfirmation('save');
  //   if (this.beacon) {
  //     this.beacon.updatedAt = new Date();
  //     await this.beaconService.saveBeacon(this.beacon);
  //   }
  }
  updateFlagValue(beaconId: string, flag: Flag, event: any): void {
    let value: any;
    
    switch (flag.type) {
      case FlagType.Boolean:
        value = event.checked===true;
        break;
      case FlagType.Number:
        value = Number(event.target.value);
        break;
      case FlagType.List:
        value = event.target.value.split(',').map((item: string) => item.trim());
        break;
      case FlagType.Dropdown:
        value = (event as MatSelectChange).value;
        break;
      default:
        value = event.target.value;
    }

    this.beaconService.updateBeaconFlag(flag.id, value);
  }

  updateSlug(beaconId: string): void {
    // const newSlug = this.slugControl.value;
    // if (newSlug && newSlug.trim()) {
    //   const success = this.beaconService.updateBeaconSlug(beaconId, newSlug.trim());
    //   if (success) {
    //     this.updateViewUrl(newSlug);
    //   } else {
    //     // Reset to original slug if update fails
    //     this.beacon$.subscribe(beacon => {
    //       if (beacon) {
    //         this.slugControl.setValue(beacon.slug);
    //       }
    //     });
    //   }
    // }
  }

  private updateViewUrl(slug: string): void {
    this.viewUrl = `${window.location.origin}/view/${slug}`;
  }

  navigateToEdit(): void {
    this.router.navigate(['/update', this.beacon?.id, 'edit']);
  }

  copyViewUrl(): void {
    navigator.clipboard.writeText(this.viewUrl);
  }
/////////////////////////////////////////////////////NEWCODEREVIEW and combine
  // copyUrl() {
  //   const url = document.querySelector('.text-blue-600')?.textContent || '';
  //   navigator.clipboard.writeText(url).then(() => {
  //     const btn = this.copyBtn.nativeElement;
  //     const originalIcon = btn.innerHTML;
  //     btn.innerHTML = '<i class="fas fa-check"></i>';
  //     setTimeout(() => {
  //       btn.innerHTML = originalIcon;
  //     }, 2000);
  //   });
  // }

  // editTitleAndDescription() {
  //   const newTitle = prompt('Edit title:', this.title.nativeElement.textContent);
  //   if (newTitle !== null) this.title.nativeElement.textContent = newTitle;

  //   const newDescription = prompt('Edit description:', this.description.nativeElement.textContent);
  //   if (newDescription !== null) this.description.nativeElement.textContent = newDescription;
  // }

  // addItem() {
    // const itemText = this.newItemInput.nativeElement.value.trim();
    // if (itemText) {
    //   const itemId = Date.now();
    //   const itemElement = document.createElement('div');
    //   itemElement.className = 'list-item bg-gray-100 rounded-lg p-3 flex items-center justify-between';
    //   itemElement.dataset['id'] = itemId.toString();
    //   itemElement.draggable = true;
    //   itemElement.innerHTML = `
    //     <div class="flex items-center">
    //       <span class="handle text-gray-500 mr-3 cursor-move"><i class="fas fa-grip-lines"></i></span>
    //       <span class="item-text">${itemText}</span>
    //     </div>
    //     <button class="delete-item text-red-500 hover:text-red-700">
    //       <i class="fas fa-trash"></i>
    //     </button>
    //   `;
    //   this.itemsList.nativeElement.appendChild(itemElement);
    //   this.newItemInput.nativeElement.value = '';

    //   itemElement.querySelector('.delete-item')?.addEventListener('click', () => {
    //     itemElement.remove();
    //   });

    //   itemElement.addEventListener('dragstart', (e) => {
    //     itemElement.classList.add('dragging');
    //     e.dataTransfer?.setData('text/plain', itemElement.dataset['id'] || '');
    //   });

    //   itemElement.addEventListener('dragend', () => {
    //     itemElement.classList.remove('dragging');
    //   });
    // }
  // }

  onItemInputKeyPress(event: KeyboardEvent) {
    // if (event.key === 'Enter') {
    //   this.addToList();
    // }
  }

  onDragOverList(event: DragEvent) {
    // event.preventDefault();
    // const draggingItem = this.itemsList.nativeElement.querySelector('.dragging');
    // const afterElement = this.getDragAfterElement(this.itemsList.nativeElement, event.clientY);

    // if (draggingItem) {
    //   if (!afterElement) {
    //     this.itemsList.nativeElement.appendChild(draggingItem);
    //   } else {
    //     this.itemsList.nativeElement.insertBefore(draggingItem, afterElement);
    //   }
    // }
  }

  getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
    const draggableElements = [...container.querySelectorAll('.list-item:not(.dragging)')] as HTMLElement[];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }).element;
  }
  showConfirmation(type: 'copyUpdate' | 'copyShare' | 'share' | 'save') {
    this.confirmation[type] = true;
    setTimeout(() => {
      this.confirmation[type] = false;
    }, 2000);
  }
}

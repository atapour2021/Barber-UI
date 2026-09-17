import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonText } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Service } from '../../core/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonText],
  template: `
  <ion-header><ion-toolbar><ion-title>Services</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    @if (loading()) { <ion-spinner /> }
    <ion-list>
      @for (s of items(); track s.id) {
        <ion-item>
          <ion-label><h3>{{s.name}}</h3><p>{{s.description ?? ''}} — {{s.price}} · {{s.duration}}m</p></ion-label>
          <ion-button fill="clear" size="small" (click)="edit(s)">Edit</ion-button>
          <ion-button fill="clear" size="small" color="danger" (click)="remove(s.id)">Del</ion-button>
        </ion-item>
      }
    </ion-list>
    <ion-button expand="block" (click)="open()">Add service</ion-button>
    <ion-modal [isOpen]="show()" (didDismiss)="show.set(false)">
      <ng-template>
        <ion-header><ion-toolbar><ion-title>{{editId ? 'Edit' : 'New'}} service</ion-title><ion-button slot="end" fill="clear" (click)="show.set(false)">Close</ion-button></ion-toolbar></ion-header>
        <ion-content class="ion-padding">
          <ion-item><ion-input label="Name" labelPlacement="stacked" [(ngModel)]="form.name" /></ion-item>
          <ion-item><ion-textarea label="Description" [(ngModel)]="form.description" /></ion-item>
          <ion-item><ion-input label="Price" type="number" [(ngModel)]="form.price" /></ion-item>
          <ion-item><ion-input label="Duration (min)" type="number" [(ngModel)]="form.duration" /></ion-item>
          <ion-item><ion-input label="Icon" [(ngModel)]="form.icon" /></ion-item>
          @if (err) { <ion-text color="danger"><p>{{err}}</p></ion-text> }
          <ion-button expand="block" (click)="save()">{{editId ? 'Update' : 'Create'}}</ion-button>
        </ion-content>
      </ng-template>
    </ion-modal>
  </ion-content>`,
})
export class ServicesPage implements OnInit {
  private api = inject(ApiService);
  items = signal<Service[]>([]); loading = signal(false); show = signal(false); err = ''; editId = '';
  form: Record<string, unknown> = {};
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.api.services.list().subscribe({ next: v => { this.items.set(v as Service[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  open() { this.editId=''; this.form={}; this.show.set(true); }
  edit(s: Service) { this.editId=s.id; this.form={ name:s.name, description:s.description, price:s.price, duration:s.duration, icon:s.icon }; this.show.set(true); }
  save() {
    const obs = this.editId ? this.api.services.update(this.editId, this.form) : this.api.services.create(this.form);
    obs.subscribe({ next: () => { this.show.set(false); this.load(); }, error: e => this.err = e.error?.message ?? 'Failed' });
  }
  remove(id: string) { this.api.services.remove(id).subscribe({ next: () => this.load() }); }
}

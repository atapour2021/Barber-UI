import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonText, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Barber } from '../../core/models';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonText, IonSelect, IonSelectOption, IonToggle],
  template: `
  <ion-header><ion-toolbar><ion-title>Barbers</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    @if (loading()) { <ion-spinner /> }
    <ion-list>
      @for (b of items(); track b.id) {
        <ion-item [routerLink]="['/barbers', b.id]">
          <ion-label><h3>{{b.fullName}}</h3><p>{{b.bio ?? ''}}</p><p>{{b.status}} · {{b.isAvailable ? 'available':'busy'}}</p></ion-label>
          <ion-button fill="clear" size="small" color="danger" (click)="remove(b.id); $event.stopPropagation()">Del</ion-button>
        </ion-item>
      }
    </ion-list>
    <ion-button expand="block" (click)="open()">Add barber</ion-button>
    <ion-modal [isOpen]="show()" (didDismiss)="show.set(false)">
      <ng-template>
        <ion-header><ion-toolbar><ion-title>{{editId ? 'Edit' : 'New'}} barber</ion-title><ion-button slot="end" fill="clear" (click)="show.set(false)">Close</ion-button></ion-toolbar></ion-header>
        <ion-content class="ion-padding">
          <ion-item><ion-input label="Full name" labelPlacement="stacked" [(ngModel)]="form.fullName" /></ion-item>
          <ion-item><ion-textarea label="Bio" labelPlacement="stacked" [(ngModel)]="form.bio" /></ion-item>
          <ion-item><ion-input label="Barbershop ID" labelPlacement="stacked" [(ngModel)]="form.barbershopId" /></ion-item>
          <ion-item><ion-select label="Status" [(ngModel)]="form.status"><ion-select-option value="active">active</ion-select-option><ion-select-option value="inactive">inactive</ion-select-option></ion-select></ion-item>
          <ion-item><ion-toggle [(ngModel)]="form.isAvailable">Available</ion-toggle></ion-item>
          @if (err) { <ion-text color="danger"><p>{{err}}</p></ion-text> }
          <ion-button expand="block" (click)="save()">{{editId ? 'Update' : 'Create'}}</ion-button>
        </ion-content>
      </ng-template>
    </ion-modal>
  </ion-content>`,
})
export class BarbersPage implements OnInit {
  private api = inject(ApiService);
  items = signal<Barber[]>([]); loading = signal(false); show = signal(false); err = ''; editId = '';
  form: Record<string, unknown> = { status: 'active', isAvailable: true };
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.api.barbers.list().subscribe({ next: v => { this.items.set(v as Barber[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  open() { this.editId = ''; this.form = { status: 'active', isAvailable: true }; this.show.set(true); }
  save() {
    const obs = this.editId ? this.api.barbers.update(this.editId, this.form) : this.api.barbers.create(this.form);
    obs.subscribe({ next: () => { this.show.set(false); this.load(); }, error: e => this.err = e.error?.message ?? 'Failed' });
  }
  remove(id: string) { this.api.barbers.remove(id).subscribe({ next: () => this.load() }); }
}

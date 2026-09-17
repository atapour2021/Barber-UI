import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonText } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Barbershop } from '../../core/models';

@Component({
  selector: 'app-barbershops',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonText],
  template: `
  <ion-header><ion-toolbar><ion-title>Barbershops</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    @if (loading()) { <ion-spinner /> }
    <ion-list>
      @for (b of shops(); track b.id) {
        <ion-item>
          <ion-label><h3>{{b.name}}</h3><p>{{b.address}}</p></ion-label>
          @if (isAdmin) { <ion-button fill="clear" size="small" color="danger" (click)="remove(b.id)">Delete</ion-button> }
        </ion-item>
      }
    </ion-list>
    @if (isAdmin) {
      <ion-button expand="block" (click)="showForm.set(true)">Add barbershop</ion-button>
      <ion-modal [isOpen]="showForm()" (didDismiss)="showForm.set(false)">
        <ng-template>
          <ion-header><ion-toolbar><ion-title>New shop</ion-title><ion-button slot="end" fill="clear" (click)="showForm.set(false)">Close</ion-button></ion-toolbar></ion-header>
          <ion-content class="ion-padding">
            <ion-item><ion-input label="Name" labelPlacement="stacked" [(ngModel)]="form.name" /></ion-item>
            <ion-item><ion-textarea label="Description" labelPlacement="stacked" [(ngModel)]="form.description" /></ion-item>
            <ion-item><ion-input label="Address" labelPlacement="stacked" [(ngModel)]="form.address" /></ion-item>
            <ion-item><ion-input label="Latitude" type="number" [(ngModel)]="form.latitude" /></ion-item>
            <ion-item><ion-input label="Longitude" type="number" [(ngModel)]="form.longitude" /></ion-item>
            <ion-item><ion-input label="Owner ID" labelPlacement="stacked" [(ngModel)]="form.ownerId" /></ion-item>
            <ion-item><ion-input label="Phone" labelPlacement="stacked" [(ngModel)]="form.phoneNumber" /></ion-item>
            @if (err) { <ion-text color="danger"><p>{{err}}</p></ion-text> }
            <ion-button expand="block" (click)="create()">Create</ion-button>
          </ion-content>
        </ng-template>
      </ion-modal>
    }
  </ion-content>`,
})
export class BarbershopsPage implements OnInit {
  private api = inject(ApiService); private auth = inject(AuthService);
  shops = signal<Barbershop[]>([]); loading = signal(false); showForm = signal(false); err = '';
  isAdmin = this.auth.isAdmin();
  form: Record<string, unknown> = { latitude: 35.7, longitude: 51.4 };
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.barbershops.list().subscribe({ next: v => { this.shops.set(v as Barbershop[]); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  create() {
    this.api.barbershops.create(this.form).subscribe({ next: () => { this.showForm.set(false); this.load(); }, error: e => this.err = e.error?.message ?? 'Failed' });
  }
  remove(id: string) { this.api.barbershops.remove(id).subscribe({ next: () => this.load() }); }
}

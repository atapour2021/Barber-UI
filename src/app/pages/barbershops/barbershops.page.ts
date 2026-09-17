import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonCard, IonCardContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Barbershop } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-barbershops',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonCard, IonCardContent, IonIcon, EmptyStateComponent],
  template: `
  <ion-header><ion-toolbar><ion-title>{{t.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content>
    <div class="page-wrap">
      @if (loading()) { <div style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{c.loading}}</p></div> }
      @if (!loading() && !shops().length) { <app-empty-state [message]="t.empty" /> }
      <ion-list lines="none" style="background:transparent">
        @for (b of shops(); track b.id) {
          <ion-card>
            <ion-card-content style="display:flex;justify-content:space-between;align-items:center">
              <ion-label><h3 style="font-weight:700">{{b.name}}</h3><p class="muted">{{b.address}}</p></ion-label>
              @if (isAdmin) { <ion-button fill="clear" size="small" color="danger" (click)="remove(b.id)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button> }
            </ion-card-content>
          </ion-card>
        }
      </ion-list>

      @if (isAdmin) {
        <ion-button expand="block" (click)="showForm.set(true)"><ion-icon name="add-outline" slot="start"></ion-icon> {{t.add}}</ion-button>
        <ion-modal [isOpen]="showForm()" (didDismiss)="showForm.set(false)">
          <ng-template>
            <ion-header><ion-toolbar><ion-title>{{t.newShop}}</ion-title><ion-button slot="end" fill="clear" (click)="showForm.set(false)">{{c.close}}</ion-button></ion-toolbar></ion-header>
            <ion-content class="ion-padding">
              <div class="page-wrap">
                <ion-item><ion-input [label]="t.name" labelPlacement="stacked" [placeholder]="t.namePlaceholder" [(ngModel)]="form.name" /></ion-item>
                <ion-item><ion-textarea [label]="t.description" labelPlacement="stacked" [(ngModel)]="form.description" /></ion-item>
                <ion-item><ion-input [label]="t.address" labelPlacement="stacked" [(ngModel)]="form.address" /></ion-item>
                <ion-item><ion-input [label]="t.latitude" type="number" [(ngModel)]="form.latitude" /></ion-item>
                <ion-item><ion-input [label]="t.longitude" type="number" [(ngModel)]="form.longitude" /></ion-item>
                <ion-item><ion-input [label]="t.ownerId" labelPlacement="stacked" [(ngModel)]="form.ownerId" /></ion-item>
                <ion-item><ion-input [label]="t.phone" labelPlacement="stacked" [placeholder]="t.phonePlaceholder" [(ngModel)]="form.phoneNumber" /></ion-item>
                <ion-button expand="block" (click)="create()" style="margin-top:14px">{{t.create}}</ion-button>
              </div>
            </ion-content>
          </ng-template>
        </ion-modal>
      }
    </div>
  </ion-content>`,
})
export class BarbershopsPage implements OnInit {
  private api = inject(ApiService); private auth = inject(AuthService); private toast = inject(ToastService);
  t = fa.barbershops; c = fa.common;
  shops = signal<Barbershop[]>([]); loading = signal(false); showForm = signal(false);
  isAdmin = this.auth.isAdmin();
  form: Record<string, unknown> = { latitude: 35.7, longitude: 51.4 };
  constructor() { addIcons({ addOutline, trashOutline }); }
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.barbershops.list().subscribe({ next: v => { this.shops.set(v as Barbershop[]); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  create() {
    this.api.barbershops.create(this.form).subscribe({
      next: () => { this.showForm.set(false); this.toast.success(this.t.createSuccess); this.load(); },
      error: e => this.toast.error(extractMessage(e)),
    });
  }
  remove(id: string) {
    this.api.barbershops.remove(id).subscribe({
      next: () => { this.toast.success(this.t.deleteSuccess); this.load(); },
      error: e => this.toast.error(extractMessage(e)),
    });
  }
}

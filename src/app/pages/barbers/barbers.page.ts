import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonSelect, IonSelectOption, IonToggle, IonCard, IonCardContent, IonIcon, IonBadge } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonSelect, IonSelectOption, IonToggle, IonCard, IonCardContent, IonIcon, IonBadge, EmptyStateComponent],
  template: `
  <ion-header><ion-toolbar><ion-title>{{t.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content>
    <div class="page-wrap">
      @if (loading()) { <div style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{c.loading}}</p></div> }
      @if (!loading() && !items().length) { <app-empty-state [message]="t.empty" /> }
      <ion-list lines="none" style="background:transparent">
        @for (b of items(); track b.id) {
          <ion-card button [routerLink]="['/barbers', b.id]">
            <ion-card-content style="display:flex;justify-content:space-between;align-items:center">
              <ion-label><h3 style="font-weight:700">{{b.fullName}}</h3><p class="muted">{{b.bio ?? ''}}</p><p><ion-badge [color]="b.isAvailable ? 'success' : 'medium'">{{b.isAvailable ? t.available : t.busy}}</ion-badge> <span class="muted">· {{b.status}}</span></p></ion-label>
              <ion-button fill="clear" size="small" color="danger" (click)="remove(b.id); $event.stopPropagation(); $event.preventDefault()"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
            </ion-card-content>
          </ion-card>
        }
      </ion-list>
      <ion-button expand="block" (click)="open()"><ion-icon name="add-outline" slot="start"></ion-icon> {{t.add}}</ion-button>

      <ion-modal [isOpen]="show()" (didDismiss)="show.set(false)">
        <ng-template>
          <ion-header><ion-toolbar><ion-title>{{editId ? t.editTitle : t.newTitle}}</ion-title><ion-button slot="end" fill="clear" (click)="show.set(false)">{{c.close}}</ion-button></ion-toolbar></ion-header>
          <ion-content class="ion-padding">
            <div class="page-wrap">
              <ion-item><ion-input [label]="t.fullName" labelPlacement="stacked" [placeholder]="t.fullNamePlaceholder" [(ngModel)]="form.fullName" /></ion-item>
              <ion-item><ion-textarea [label]="t.bio" labelPlacement="stacked" [placeholder]="t.bioPlaceholder" [(ngModel)]="form.bio" /></ion-item>
              <ion-item><ion-input [label]="t.barbershopId" labelPlacement="stacked" [(ngModel)]="form.barbershopId" /></ion-item>
              <ion-item><ion-select [label]="t.status" [(ngModel)]="form.status"><ion-select-option value="active">{{t.statusActive}}</ion-select-option><ion-select-option value="inactive">{{t.statusInactive}}</ion-select-option></ion-select></ion-item>
              <ion-item><ion-toggle [(ngModel)]="form.isAvailable">{{t.available}}</ion-toggle></ion-item>
              <ion-button expand="block" (click)="save()" style="margin-top:14px"><ion-icon name="create-outline" slot="start"></ion-icon> {{editId ? c.update : c.create}}</ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    </div>
  </ion-content>`,
})
export class BarbersPage implements OnInit {
  private api = inject(ApiService); private toast = inject(ToastService);
  t = fa.barbers; c = fa.common;
  items = signal<Barber[]>([]); loading = signal(false); show = signal(false); editId = '';
  form: Record<string, unknown> = { status: 'active', isAvailable: true };
  constructor() { addIcons({ addOutline, trashOutline, createOutline }); }
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.api.barbers.list().subscribe({ next: v => { this.items.set(v as Barber[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  open() { this.editId = ''; this.form = { status: 'active', isAvailable: true }; this.show.set(true); }
  save() {
    const obs = this.editId ? this.api.barbers.update(this.editId, this.form) : this.api.barbers.create(this.form);
    obs.subscribe({
      next: () => { this.show.set(false); this.toast.success(this.editId ? this.t.updateSuccess : this.t.createSuccess); this.load(); },
      error: e => this.toast.error(extractMessage(e)),
    });
  }
  remove(id: string) {
    this.api.barbers.remove(id).subscribe({
      next: () => { this.toast.success(this.t.deleteSuccess); this.load(); },
      error: e => this.toast.error(extractMessage(e)),
    });
  }
}

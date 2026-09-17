import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonCard, IonCardContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSpinner, IonCard, IonCardContent, IonIcon, EmptyStateComponent],
  template: `
  <ion-header><ion-toolbar><ion-title>{{t.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content>
    <div class="page-wrap">
      @if (loading()) { <div style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{c.loading}}</p></div> }
      @if (!loading() && !items().length) { <app-empty-state [message]="t.empty" /> }
      <ion-list lines="none" style="background:transparent">
        @for (s of items(); track s.id) {
          <ion-card>
            <ion-card-content style="display:flex;justify-content:space-between;align-items:center">
              <ion-label><h3 style="font-weight:700">{{s.name}}</h3><p class="muted">{{s.description ?? ''}} — {{s.price}} · {{s.duration}}دقیقه</p></ion-label>
              <span style="display:flex;gap:4px">
                <ion-button fill="clear" size="small" (click)="edit(s)"><ion-icon name="create-outline" slot="icon-only"></ion-icon></ion-button>
                <ion-button fill="clear" size="small" color="danger" (click)="remove(s.id)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
              </span>
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
              <ion-item><ion-input [label]="t.name" labelPlacement="stacked" [placeholder]="t.namePlaceholder" [(ngModel)]="form.name" /></ion-item>
              <ion-item><ion-textarea [label]="t.description" labelPlacement="stacked" [(ngModel)]="form.description" /></ion-item>
              <ion-item><ion-input [label]="t.price" type="number" [(ngModel)]="form.price" /></ion-item>
              <ion-item><ion-input [label]="t.duration" type="number" [(ngModel)]="form.duration" /></ion-item>
              <ion-item><ion-input [label]="t.icon" [(ngModel)]="form.icon" /></ion-item>
              <ion-button expand="block" (click)="save()" style="margin-top:14px">{{editId ? c.update : c.create}}</ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    </div>
  </ion-content>`,
})
export class ServicesPage implements OnInit {
  private api = inject(ApiService); private toast = inject(ToastService);
  t = fa.services; c = fa.common;
  items = signal<Service[]>([]); loading = signal(false); show = signal(false); editId = '';
  form: Record<string, unknown> = {};
  constructor() { addIcons({ addOutline, trashOutline, createOutline }); }
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.api.services.list().subscribe({ next: v => { this.items.set(v as Service[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  open() { this.editId=''; this.form={}; this.show.set(true); }
  edit(s: Service) { this.editId=s.id; this.form={ name:s.name, description:s.description, price:s.price, duration:s.duration, icon:s.icon }; this.show.set(true); }
  save() {
    const obs = this.editId ? this.api.services.update(this.editId, this.form) : this.api.services.create(this.form);
    obs.subscribe({
      next: () => { this.show.set(false); this.toast.success(this.editId ? this.t.updateSuccess : this.t.createSuccess); this.load(); },
      error: e => this.toast.error(extractMessage(e)),
    });
  }
  remove(id: string) {
    this.api.services.remove(id).subscribe({
      next: () => { this.toast.success(this.t.deleteSuccess); this.load(); },
      error: e => this.toast.error(extractMessage(e)),
    });
  }
}

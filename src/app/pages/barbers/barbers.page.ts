import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonList,
  IonLabel,
  IonButton,
  IonModal,
  IonSpinner,
  IonToggle,
  IonItem,
  IonCard,
  IonCardContent,
  IonIcon,
  IonBadge,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiInputComponent, UiTextareaComponent, UiSelectComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonList, IonLabel, IonButton, IonModal, IonSpinner, IonToggle, IonItem, IonCard, IonCardContent, IonIcon, IonBadge, EmptyStateComponent, UiInputComponent, UiTextareaComponent, UiSelectComponent, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap" dir="rtl">
        <div class="section-head"><h3>{{ t.title }}</h3><span class="muted">{{ items().length }} نفر</span></div>
        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{ c.loading }}</p></div>
        }
        @if (!loading() && !items().length) {
          <app-empty-state [message]="t.empty" />
        }
        <ion-list lines="none" style="background:transparent;width:100%">
          @for (b of items(); track b.id) {
            <ion-card button [routerLink]="['/barbers', b.id]" style="margin-bottom:10px;overflow:hidden">
              <ion-card-content style="display:flex;justify-content:space-between;align-items:center;gap:10px">
                <ion-label style="min-width:0"><h3 style="font-weight:800;color:var(--text-primary);font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ b.fullName }}</h3>
                  <p class="muted" style="margin:2px 0 0">{{ b.bio ?? '' }}</p>
                  <p style="margin:4px 0 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <ion-badge [color]="b.isAvailable ? 'success' : 'medium'" style="font-size:10px">{{ b.isAvailable ? t.available : t.busy }}</ion-badge>
                    <span class="muted">· {{ b.status }}</span>
                  </p></ion-label>
                <ion-button fill="clear" size="small" color="danger" (click)="remove(b.id); $event.stopPropagation(); $event.preventDefault()"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
        <app-ui-button icon="add-outline" (pressed)="open()">{{ t.add }}</app-ui-button>
        <ion-modal [isOpen]="show()" (didDismiss)="show.set(false)">
          <ng-template>
            <ion-content class="ion-padding" [fullscreen]="true">
              <div class="page-wrap" dir="rtl">
                <div class="section-head" style="margin-bottom:12px"><h3>{{ editId ? t.editTitle : t.newTitle }}</h3><ion-button fill="clear" size="small" (click)="show.set(false)">{{ c.close }}</ion-button></div>
                <app-ui-input [label]="t.fullName" [placeholder]="t.fullNamePlaceholder" [(ngModel)]="form.fullName" />
                <app-ui-textarea [label]="t.bio" [placeholder]="t.bioPlaceholder" [(ngModel)]="form.bio" />
                <app-ui-input [label]="t.barbershopId" [(ngModel)]="form.barbershopId" />
                <app-ui-select [label]="t.status" [(ngModel)]="form.status" [options]="statusOpts" />
                <ion-item style="--background:transparent;border:1px solid var(--card-border);border-radius:10px;margin-top:8px"><ion-toggle [(ngModel)]="form.isAvailable">{{ t.available }}</ion-toggle></ion-item>
                <app-ui-button icon="create-outline" (pressed)="save()">{{ editId ? c.update : c.create }}</app-ui-button>
              </div>
            </ion-content>
          </ng-template>
        </ion-modal>
      </div>
    </ion-content>`,
})
export class BarbersPage implements OnInit {
  private api = inject(ApiService);
  t = fa.barbers;
  c = fa.common;
  statusOpts = [{ value: 'active', label: fa.barbers.statusActive },{ value: 'inactive', label: fa.barbers.statusInactive }];
  items = signal<Barber[]>([]);
  loading = signal(false);
  show = signal(false);
  editId = '';
  form: Record<string, unknown> = { status: 'active', isAvailable: true };
  constructor() { addIcons({ addOutline, trashOutline, createOutline }); }
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.api.barbers.list().subscribe({ next: (v) => { this.items.set(v as Barber[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  open() { this.editId = ''; this.form = { status: 'active', isAvailable: true }; this.show.set(true); }
  save() { const obs = this.editId ? this.api.barbers.update(this.editId, this.form) : this.api.barbers.create(this.form); obs.subscribe({ next: () => { this.show.set(false); this.load(); } }); }
  remove(id: string) { this.api.barbers.remove(id).subscribe({ next: () => this.load() }); }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonList, IonLabel, IonButton, IonSpinner, IonSegment, IonSegmentButton, IonBadge, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, trashOutline, addOutline, searchOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiInputComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonList, IonLabel, IonButton, IonSpinner, IonSegment, IonSegmentButton, IonBadge, IonIcon, EmptyStateComponent, UiInputComponent, UiButtonComponent],
  template: `
  <ion-header><ion-toolbar><ion-title>{{t.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content [fullscreen]="true">
    <div class="page-wrap">
      <ion-segment [value]="tab" (ionChange)="tab=($event.detail.value ?? 'dash')!.toString()" style="width:100%">
        <ion-segment-button value="dash">{{t.dashboard}}</ion-segment-button>
        <ion-segment-button value="users">{{t.users}}</ion-segment-button>
        <ion-segment-button value="appointments">{{t.appointments}}</ion-segment-button>
        <ion-segment-button value="settings">{{t.settings}}</ion-segment-button>
      </ion-segment>
      @if (tab === 'dash') {
        @if (dashLoading()) { <div style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{c.loading}}</p></div> }
        @if (dash()) {
          <div class="grid-2" style="margin-top:14px">
            <ion-card class="stat-card"><ion-card-content><b>{{dash()!.totalUsers}}</b><p class="muted">{{t.totalUsers}}</p></ion-card-content></ion-card>
            <ion-card class="stat-card"><ion-card-content><b>{{dash()!.totalBarbers}}</b><p class="muted">{{t.totalBarbers}}</p></ion-card-content></ion-card>
            <ion-card class="stat-card"><ion-card-content><b>{{dash()!.totalAppointments}}</b><p class="muted">{{t.totalAppointments}}</p></ion-card-content></ion-card>
            <ion-card class="stat-card"><ion-card-content><b>{{dash()!.totalBarbershops}}</b><p class="muted">{{t.totalShops}}</p></ion-card-content></ion-card>
          </div>
        }
        <app-ui-button size="small" fill="outline" icon="refresh-outline" (pressed)="loadDash()">{{t.refresh}}</app-ui-button>
      }
      @if (tab === 'users') {
        <div class="card-modern" style="margin-top:12px;display:flex;gap:8px;align-items:center">
          <app-ui-input [label]="t.search" [(ngModel)]="uq.search" style="flex:1" />
          <ion-button (click)="loadUsers()"><ion-icon name="search-outline" slot="icon-only"></ion-icon></ion-button>
        </div>
        @if (!users().length) { <app-empty-state [message]="c.empty" /> }
        <ion-list lines="none" style="background:transparent;margin-top:8px;width:100%">
          @for (u of users(); track u.id) {
            <ion-card>
              <ion-card-content style="display:flex;justify-content:space-between;align-items:center">
                <ion-label><h3 style="font-weight:700">{{u.username}} <span class="muted">({{u.role}})</span></h3><p class="muted">{{u.name}} {{u.family}} · {{u.isActive ? c.success : c.cancel}}</p></ion-label>
                <ion-button fill="clear" size="small" color="danger" (click)="delUser(u.id)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
      }
      @if (tab === 'appointments') {
        @if (!appts().length) { <app-empty-state [message]="c.empty" /> }
        <ion-list lines="none" style="background:transparent;margin-top:12px;width:100%">
          @for (a of appts(); track a.id) {
            <ion-card><ion-card-content style="display:flex;justify-content:space-between;align-items:center"><ion-label><h3 style="font-weight:700">{{a.date}} {{a.startTime}}</h3><p class="muted">{{a.status}}</p></ion-label><ion-badge>{{a.status}}</ion-badge></ion-card-content></ion-card>
          }
        </ion-list>
        <app-ui-button size="small" fill="outline" (pressed)="loadAppts()">{{t.refresh}}</app-ui-button>
      }
      @if (tab === 'settings') {
        <div class="card-modern" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <app-ui-input [label]="t.key" [(ngModel)]="newKey" style="flex:1;min-width:120px" />
          <app-ui-input [label]="t.value" [(ngModel)]="newVal" style="flex:1;min-width:120px" />
          <ion-button (click)="createSetting()"><ion-icon name="add-outline" slot="icon-only"></ion-icon></ion-button>
        </div>
        <ion-list lines="none" style="background:transparent;margin-top:8px;width:100%">
          @for (s of settings(); track s.key) {
            <ion-card><ion-card-content style="display:flex;justify-content:space-between;align-items:center"><ion-label>{{s.key}} = {{s.value}}</ion-label><ion-button fill="clear" color="danger" (click)="delSetting(s.key)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button></ion-card-content></ion-card>
          }
        </ion-list>
      }
    </div>
  </ion-content>`,
})
export class AdminPage implements OnInit {
  private api = inject(ApiService);
  t = fa.admin; c = fa.common;
  tab = 'dash';
  dash = signal<{ totalUsers:number; totalBarbers:number; totalAppointments:number; totalBarbershops:number; appointmentsByStatus:Record<string,number> } | null>(null);
  dashLoading = signal(false);
  users = signal<{ id:string; username:string; role:string; name:string; family:string; isActive:boolean }[]>([]);
  appts = signal<{ id:string; date:string; startTime:string; status:string }[]>([]);
  settings = signal<{ key:string; value?:string | null }[]>([]);
  uq: Record<string, unknown> = {}; newKey=''; newVal='';
  constructor() { addIcons({ refreshOutline, trashOutline, addOutline, searchOutline }); }
  ngOnInit() { this.loadDash(); this.loadUsers(); this.loadSettings(); }
  loadDash() { this.dashLoading.set(true); this.api.admin.dashboard().subscribe({ next: v => { this.dash.set(v as never); this.dashLoading.set(false); }, error: () => this.dashLoading.set(false) }); }
  loadUsers() { this.api.admin.users(this.uq).subscribe({ next: v => { const arr = Array.isArray(v) ? v : (v as { data: unknown[] }).data ?? []; this.users.set(arr as never); } }); }
  delUser(id: string) { this.api.admin.deleteUser(id).subscribe({ next: () => this.loadUsers() }); }
  loadAppts() { this.api.admin.adminAppointments({}).subscribe({ next: v => { const arr = Array.isArray(v) ? v : (v as { data: unknown[] }).data ?? []; this.appts.set(arr as never); } }); }
  loadSettings() { this.api.admin.settings().subscribe({ next: v => this.settings.set(v as { key:string; value?:string | null }[]) }); }
  createSetting() {
    this.api.admin.createSetting({ key: this.newKey, value: this.newVal }).subscribe({ next: () => { this.newKey=''; this.newVal=''; this.loadSettings(); } });
  }
  delSetting(k: string) { this.api.admin.deleteSetting(k).subscribe({ next: () => this.loadSettings() }); }
}

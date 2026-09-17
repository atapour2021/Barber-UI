import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonSegment, IonSegmentButton, IonBadge } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonSegment, IonSegmentButton, IonBadge],
  template: `
  <ion-header><ion-toolbar><ion-title>Admin</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-segment [value]="tab" (ionChange)="tab=($event.detail.value ?? 'dash')!.toString()">
      <ion-segment-button value="dash">Dashboard</ion-segment-button>
      <ion-segment-button value="users">Users</ion-segment-button>
      <ion-segment-button value="appointments">Appointments</ion-segment-button>
      <ion-segment-button value="settings">Settings</ion-segment-button>
    </ion-segment>
    @if (tab === 'dash') {
      @if (dashLoading()) { <ion-spinner /> }
      @if (dash()) { <ion-card><ion-card-content><p>Users: {{dash()!.totalUsers}} · Barbers: {{dash()!.totalBarbers}} · Appointments: {{dash()!.totalAppointments}} · Shops: {{dash()!.totalBarbershops}}</p></ion-card-content></ion-card> }
      <ion-button size="small" (click)="loadDash()">Refresh</ion-button>
    }
    @if (tab === 'users') {
      <ion-item><ion-input label="Search" [(ngModel)]="uq.search" /><ion-button (click)="loadUsers()">Go</ion-button></ion-item>
      <ion-list>
        @for (u of users(); track u.id) {
          <ion-item><ion-label><h3>{{u.username}} ({{u.role}})</h3><p>{{u.name}} {{u.family}} · {{u.isActive ? 'active':'inactive'}}</p></ion-label>
            <ion-button fill="clear" size="small" color="danger" (click)="delUser(u.id)">Del</ion-button>
          </ion-item>
        }
      </ion-list>
    }
    @if (tab === 'appointments') {
      <ion-list>
        @for (a of appts(); track a.id) { <ion-item><ion-label><h3>{{a.date}} {{a.startTime}}</h3><p>{{a.status}}</p></ion-label><ion-badge>{{a.status}}</ion-badge></ion-item> }
      </ion-list>
      <ion-button size="small" (click)="loadAppts()">Load</ion-button>
    }
    @if (tab === 'settings') {
      <ion-item><ion-input label="Key" [(ngModel)]="newKey" /><ion-input label="Value" [(ngModel)]="newVal" /><ion-button (click)="createSetting()">Add</ion-button></ion-item>
      <ion-list>
        @for (s of settings(); track s.key) { <ion-item><ion-label>{{s.key}} = {{s.value}}</ion-label><ion-button fill="clear" color="danger" (click)="delSetting(s.key)">Del</ion-button></ion-item> }
      </ion-list>
    }
  </ion-content>`,
})
export class AdminPage implements OnInit {
  private api = inject(ApiService);
  tab = 'dash';
  dash = signal<{ totalUsers:number; totalBarbers:number; totalAppointments:number; totalBarbershops:number; appointmentsByStatus:Record<string,number> } | null>(null);
  dashLoading = signal(false);
  users = signal<{ id:string; username:string; role:string; name:string; family:string; isActive:boolean }[]>([]);
  appts = signal<{ id:string; date:string; startTime:string; status:string }[]>([]);
  settings = signal<{ key:string; value?:string | null }[]>([]);
  uq: Record<string, unknown> = {}; newKey=''; newVal='';
  ngOnInit() { this.loadDash(); this.loadUsers(); this.loadSettings(); }
  loadDash() { this.dashLoading.set(true); this.api.admin.dashboard().subscribe({ next: v => { this.dash.set(v as never); this.dashLoading.set(false); }, error: () => this.dashLoading.set(false) }); }
  loadUsers() { this.api.admin.users(this.uq).subscribe({ next: v => { const arr = Array.isArray(v) ? v : (v as { data: unknown[] }).data ?? []; this.users.set(arr as never); } }); }
  delUser(id: string) { this.api.admin.deleteUser(id).subscribe({ next: () => this.loadUsers() }); }
  loadAppts() { this.api.admin.adminAppointments({}).subscribe({ next: v => { const arr = Array.isArray(v) ? v : (v as { data: unknown[] }).data ?? []; this.appts.set(arr as never); } }); }
  loadSettings() { this.api.admin.settings().subscribe({ next: v => this.settings.set(v as { key:string; value?:string | null }[]) }); }
  createSetting() { this.api.admin.createSetting({ key: this.newKey, value: this.newVal }).subscribe({ next: () => this.loadSettings() }); }
  delSetting(k: string) { this.api.admin.deleteSetting(k).subscribe({ next: () => this.loadSettings() }); }
}

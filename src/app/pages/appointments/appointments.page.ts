import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonSpinner, IonText, IonBadge } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Appointment, Barber, Service } from '../../core/models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonSpinner, IonText, IonBadge],
  template: `
  <ion-header><ion-toolbar><ion-title>Appointments</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-select label="Filter status" [(ngModel)]="filter" (ionChange)="load()"><ion-select-option value="">All</ion-select-option><ion-select-option value="pending">pending</ion-select-option><ion-select-option value="confirmed">confirmed</ion-select-option><ion-select-option value="completed">completed</ion-select-option><ion-select-option value="cancelled">cancelled</ion-select-option></ion-select></ion-item>
    @if (loading()) { <div style="text-align:center"><ion-spinner /></div> }
    <ion-list>
      @for (a of items(); track a.id) {
        <ion-item>
          <ion-label><h3>{{a.date}} {{a.startTime}} - {{a.endTime}}</h3><p>{{a.notes ?? ''}}</p></ion-label>
          <ion-badge>{{a.status}}</ion-badge>
        </ion-item>
        <ion-item lines="none">
          <ion-button fill="clear" size="small" color="danger" (click)="cancel(a.id)">Cancel</ion-button>
          <ion-button fill="clear" size="small" (click)="setStatus(a.id,'confirmed')">Confirm</ion-button>
          <ion-button fill="clear" size="small" (click)="setStatus(a.id,'completed')">Done</ion-button>
        </ion-item>
      }
    </ion-list>
    <ion-button expand="block" (click)="show.set(true)">Book appointment</ion-button>
    <ion-modal [isOpen]="show()" (didDismiss)="show.set(false)">
      <ng-template>
        <ion-header><ion-toolbar><ion-title>Book</ion-title><ion-button slot="end" fill="clear" (click)="show.set(false)">Close</ion-button></ion-toolbar></ion-header>
        <ion-content class="ion-padding">
          <ion-item><ion-select label="Barber" [(ngModel)]="form.barberId" (ionChange)="onBarberChange()">@for(b of barbers(); track b.id){<ion-select-option [value]="b.id">{{b.fullName}}</ion-select-option>}</ion-select></ion-item>
          <ion-item><ion-select label="Service" [(ngModel)]="form.serviceId">@for(s of services(); track s.id){<ion-select-option [value]="s.id">{{s.name}}</ion-select-option>}</ion-select></ion-item>
          <ion-item><ion-input label="Date" type="date" [(ngModel)]="form.date" /></ion-item>
          <ion-button size="small" (click)="loadSlots()">Check slots</ion-button>
          <ion-list>@for (sl of slots(); track $index) { <ion-item button (click)="pickSlot(sl)"><ion-label>{{sl.startTime}} - {{sl.endTime}} · {{sl.status}}</ion-label></ion-item> }</ion-list>
          <ion-item><ion-input label="Start time" [(ngModel)]="form.startTime" /></ion-item>
          <ion-item><ion-input label="End time" [(ngModel)]="form.endTime" /></ion-item>
          <ion-item><ion-textarea label="Notes" [(ngModel)]="form.notes" /></ion-item>
          @if (err) { <ion-text color="danger"><p>{{err}}</p></ion-text> }
          <ion-button expand="block" (click)="book()">Create</ion-button>
        </ion-content>
      </ng-template>
    </ion-modal>
  </ion-content>`,
})
export class AppointmentsPage implements OnInit {
  private api = inject(ApiService); private route = inject(ActivatedRoute);
  items = signal<Appointment[]>([]); barbers = signal<Barber[]>([]); services = signal<Service[]>([]); slots = signal<{ startTime:string; endTime:string; status:string }[]>([]);
  loading = signal(false); filter = ''; show = signal(false); err = '';
  form: Record<string, string> = { date: new Date().toISOString().slice(0,10), startTime: '', endTime: '' };
  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('barberId'); if (q) this.form['barberId'] = q;
    this.api.barbers.list().subscribe({ next: v => this.barbers.set(v as Barber[]) });
    this.api.services.list().subscribe({ next: v => this.services.set(v as Service[]) });
    this.load();
  }
  load() { this.loading.set(true); this.api.appointments.list(this.filter ? { status: this.filter } : {}).subscribe({ next: v => { this.items.set((Array.isArray(v) ? v : (v as { data: Appointment[] }).data ?? []) as Appointment[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  onBarberChange() { const bid = this.form['barberId']; if (bid) this.api.services.list({ barberId: bid }).subscribe({ next: v => this.services.set(v as Service[]) }); }
  loadSlots() {
    if (!this.form['barberId'] || !this.form['date']) return;
    const p: Record<string,string> = { barberId: this.form['barberId'], date: this.form['date'] };
    if (this.form['serviceId']) p['serviceId'] = this.form['serviceId'];
    this.api.appointments.slots(p).subscribe({ next: v => { const arr = (v as { slots?: unknown[] })?.slots ?? v; this.slots.set((Array.isArray(arr) ? arr : []) as never); }});
  }
  pickSlot(s: { startTime:string; endTime:string }) { this.form['startTime'] = s.startTime; this.form['endTime'] = s.endTime; }
  book() { this.api.appointments.create(this.form).subscribe({ next: () => { this.show.set(false); this.load(); }, error: e => this.err = e.error?.message ?? 'Failed' }); }
  cancel(id: string) { this.api.appointments.cancel(id).subscribe({ next: () => this.load() }); }
  setStatus(id: string, status: string) { this.api.appointments.status(id, status).subscribe({ next: () => this.load() }); }
}

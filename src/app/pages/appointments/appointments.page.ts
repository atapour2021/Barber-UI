import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonList,
  IonLabel,
  IonButton,
  IonModal,
  IonSpinner,
  IonBadge,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, timeOutline, calendarOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Appointment, Barber, Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import {
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiDatepickerComponent,
  UiButtonComponent,
} from '../../shared/ui/ui';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonList,
    IonLabel,
    IonButton,
    IonModal,
    IonSpinner,
    IonBadge,
    IonCard,
    IonCardContent,
    IonIcon,
    IonItem,
    EmptyStateComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiSelectComponent,
    UiDatepickerComponent,
    UiButtonComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap" dir="rtl">
        <div class="section-head">
          <h3>{{ t.title }}</h3>
          <span class="muted">{{ items().length }} {{ t.all }}</span>
        </div>
        <div class="dark-card" style="padding:10px">
          <app-ui-select
            [label]="t.filterStatus"
            [(ngModel)]="filter"
            [options]="filterOpts"
            (ngModelChange)="load()"
          />
        </div>
        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px">
            <ion-spinner></ion-spinner>
            <p class="muted">{{ c.loading }}</p>
          </div>
        }
        @if (!loading() && !items().length) {
          <app-empty-state [message]="t.empty" />
        }
        <ion-list lines="none" style="background:transparent;width:100%">
          @for (a of items(); track a.id) {
            <ion-card class="dark-appoint">
              <ion-card-content>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
                  <h3 style="margin:0;font-weight:800;font-size:13px;color:var(--text-primary);display:flex;align-items:center;gap:6px">
                    <ion-icon name="calendar-outline" style="color:var(--accent)"></ion-icon>
                    {{ a.date }} {{ a.startTime }} - {{ a.endTime }}
                  </h3>
                  <ion-badge
                    [color]="
                      a.status === 'cancelled'
                        ? 'danger'
                        : a.status === 'confirmed'
                          ? 'success'
                          : a.status === 'completed'
                            ? 'primary'
                            : 'warning'
                    "
                    style="font-size:10px"
                    >{{ a.status }}</ion-badge
                  >
                </div>
                @if (a.notes) {
                  <p class="muted" style="margin:6px 0 0">{{ a.notes }}</p>
                }
                <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
                  <app-ui-button fill="outline" color="danger" size="small" (pressed)="cancel(a.id)">{{ t.cancel }}</app-ui-button>
                  <app-ui-button fill="outline" size="small" (pressed)="setStatus(a.id, 'confirmed')">{{ t.confirm }}</app-ui-button>
                  <app-ui-button size="small" (pressed)="setStatus(a.id, 'completed')">{{ t.done }}</app-ui-button>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
        <app-ui-button icon="add-outline" (pressed)="show.set(true)">{{ t.book }}</app-ui-button>
        <ion-modal [isOpen]="show()" (didDismiss)="show.set(false)">
          <ng-template>
            <ion-content class="ion-padding" [fullscreen]="true">
              <div class="page-wrap" dir="rtl">
                <div class="section-head" style="margin-bottom:12px">
                  <h3>{{ t.bookTitle }}</h3>
                  <ion-button fill="clear" size="small" (click)="show.set(false)">{{ c.close }}</ion-button>
                </div>
                <app-ui-select [label]="t.barber" [(ngModel)]="form.barberId" [options]="barberOpts" (ngModelChange)="onBarberChange()" />
                <app-ui-select [label]="t.service" [(ngModel)]="form.serviceId" [options]="serviceOpts" />
                <app-ui-datepicker [label]="t.date" [(ngModel)]="form.date" />
                <app-ui-button fill="outline" size="small" icon="time-outline" (pressed)="loadSlots()">{{ t.checkSlots }}</app-ui-button>
                <ion-list lines="none" style="background:transparent">
                  @for (sl of slots(); track $index) {
                    <ion-item button (click)="pickSlot(sl)" style="--background:var(--card-bg);border:1px solid var(--card-border);margin-bottom:6px;border-radius:10px">
                      <ion-label style="color:var(--text-primary)">{{ sl.startTime }} - {{ sl.endTime }} · {{ sl.status }}</ion-label>
                    </ion-item>
                  }
                </ion-list>
                <app-ui-input [label]="t.startTime" [(ngModel)]="form.startTime" />
                <app-ui-input [label]="t.endTime" [(ngModel)]="form.endTime" />
                <app-ui-textarea [label]="t.notes" [placeholder]="t.notesPlaceholder" [(ngModel)]="form.notes" />
                <app-ui-button (pressed)="book()">{{ t.create }}</app-ui-button>
              </div>
            </ion-content>
          </ng-template>
        </ion-modal>
      </div>
    </ion-content>`,
  styles: [`.dark-appoint{margin-bottom:10px}`],
})
export class AppointmentsPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  t = fa.appointments;
  c = fa.common;
  filterOpts = [
    { value: '', label: fa.appointments.all },
    { value: 'pending', label: fa.appointments.pending },
    { value: 'confirmed', label: fa.appointments.confirmed },
    { value: 'completed', label: fa.appointments.completed },
    { value: 'cancelled', label: fa.appointments.cancelled },
  ];
  items = signal<Appointment[]>([]);
  barbers = signal<Barber[]>([]);
  services = signal<Service[]>([]);
  slots = signal<{ startTime: string; endTime: string; status: string }[]>([]);
  loading = signal(false);
  filter = '';
  show = signal(false);
  form: Record<string, string> = {
    date: new Date().toISOString().slice(0, 10),
    startTime: '',
    endTime: '',
  };
  get barberOpts() {
    return this.barbers().map((b) => ({ value: b.id, label: b.fullName }));
  }
  get serviceOpts() {
    return this.services().map((s) => ({ value: s.id, label: s.name }));
  }
  constructor() {
    addIcons({ addOutline, timeOutline, calendarOutline });
  }
  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('barberId');
    if (q) this.form['barberId'] = q;
    this.api.barbers.list().subscribe({ next: (v) => this.barbers.set(v as Barber[]) });
    this.api.services.list().subscribe({ next: (v) => this.services.set(v as Service[]) });
    this.load();
  }
  load() {
    this.loading.set(true);
    this.api.appointments.list(this.filter ? { status: this.filter } : {}).subscribe({
      next: (v) => {
        this.items.set((Array.isArray(v) ? v : ((v as { data: Appointment[] }).data ?? [])) as Appointment[]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  onBarberChange() {
    const bid = this.form['barberId'];
    if (bid) this.api.services.list({ barberId: bid }).subscribe({ next: (v) => this.services.set(v as Service[]) });
  }
  loadSlots() {
    if (!this.form['barberId'] || !this.form['date']) return;
    const p: Record<string, string> = { barberId: this.form['barberId'], date: this.form['date'] };
    if (this.form['serviceId']) p['serviceId'] = this.form['serviceId'];
    this.api.appointments.slots(p).subscribe({
      next: (v) => {
        const arr = (v as { slots?: unknown[] })?.slots ?? v;
        this.slots.set((Array.isArray(arr) ? arr : []) as never);
      },
    });
  }
  pickSlot(s: { startTime: string; endTime: string }) {
    this.form['startTime'] = s.startTime;
    this.form['endTime'] = s.endTime;
  }
  book() {
    this.api.appointments.create(this.form).subscribe({ next: () => { this.show.set(false); this.load(); } });
  }
  cancel(id: string) {
    this.api.appointments.cancel(id).subscribe({ next: () => this.load() });
  }
  setStatus(id: string, status: string) {
    this.api.appointments.status(id, status).subscribe({ next: () => this.load() });
  }
}

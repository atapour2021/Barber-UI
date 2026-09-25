import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Barber, Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [FormsModule, IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap create-wrap" dir="rtl">
        <div class="head">
          <h1>{{ ta.bookTitle }}</h1>
          <p>{{ ta.barber }}، {{ ta.service }} و {{ ta.date }} را انتخاب کنید</p>
        </div>

        @if (loadingMeta()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ fa.common.loading }}</p></div>
        } @else {
          <div class="dark-card form-card">
            <label class="lbl">{{ ta.barber }}</label>
            <select [(ngModel)]="barberId" (ngModelChange)="onBarberChange()" class="sel">
              <option value="">{{ tc.search }}</option>
              @for (b of barbers(); track b.id) { <option [value]="b.id">{{ b.fullName }}</option> }
            </select>

            <label class="lbl">{{ ta.service }}</label>
            <select [(ngModel)]="serviceId" (ngModelChange)="loadSlots()" class="sel">
              <option value="">{{ tc.search }}</option>
              @for (s of servicesFiltered; track s.id) { <option [value]="s.id">{{ s.name }} — {{ s.duration }}{{ ts.minute }} — {{ s.price }} {{ ts.currency }}</option> }
            </select>

            <label class="lbl">{{ ta.date }}</label>
            <input type="date" [(ngModel)]="date" (ngModelChange)="loadSlots()" class="sel" [min]="todayIso" />

            <label class="lbl" style="margin-top:4px">{{ ta.startTime }}</label>
            @if (loadingSlots()) {
              <div style="text-align:center;padding:12px"><ion-spinner></ion-spinner></div>
            } @else if (!slots().length) {
              <p class="muted" style="margin:0;font-size:11px">{{ ta.empty }}</p>
            } @else {
              <div class="slots">
                @for (sl of slots(); track sl.startTime) {
                  <button type="button" class="slot" [class.sel]="selectedSlot()?.startTime===sl.startTime" [class.booked]="isBooked(sl)" [disabled]="isBooked(sl)" (click)="pick(sl)">
                    {{ timeLabel(sl) }}
                  </button>
                }
              </div>
              @if (slotReason()) { <p class="muted" style="margin:6px 0 0;font-size:11px">{{ slotReason() }}</p> }
            }
            @if (selectedSlot()) {
              <div style="display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:11px">
                <span class="muted">انتخاب:</span><b style="color:var(--text-primary)" dir="ltr">{{ selectedSlot()!.startTime.slice(11,16) }} - {{ selectedSlot()!.endTime.slice(11,16) }}</b>
              </div>
            }
          </div>

          <div class="dark-card form-card">
            <label class="lbl">{{ ta.notes }} ({{ fa.bookingExtra.optional }})</label>
            <textarea [(ngModel)]="notes" rows="2" maxlength="500" [placeholder]="ta.notesPlaceholder" class="ta"></textarea>
            @if (errorMsg()) { <div class="alert-error" style="text-align:center">{{ errorMsg() }}</div> }
            @if (successMsg()) { <div class="alert-ok" style="text-align:center">{{ successMsg() }}</div> }
            <button type="button" class="cta" (click)="create()" [disabled]="creating() || !canCreate()">
              @if (creating()) { <ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner> }
              @else { {{ ta.create }} }
            </button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .create-wrap { gap:14px; padding-top:14px; max-width:640px; }
    .head { text-align:right; }
    .head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .head p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .form-card { display:flex; flex-direction:column; gap:10px; padding:14px; }
    .lbl { font-size:11px; font-weight:700; color:var(--text-primary); text-align:right; }
    .sel, .ta { width:100%; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:10px 12px; color:var(--text-primary); font-family:inherit; font-size:13px; outline:none; }
    .ta { resize:vertical; min-height:64px; }
    .slots { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    @media (max-width:480px){ .slots{ grid-template-columns:repeat(2,1fr);} }
    .slot { border:1px solid var(--card-border); background:transparent; color:var(--text-primary); border-radius:8px; padding:8px; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; direction:ltr; }
    .slot.sel { background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .slot.booked { opacity:0.38; cursor:default; color:var(--text-muted); }
    .cta { width:100%; min-height:46px; border:none; border-radius:10px; background:var(--accent); color:var(--accent-contrast); font-size:13px; font-weight:800; font-family:inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:12px; }
    .cta:disabled { opacity:0.55; cursor:default; }
  `],
})
export class AppointmentCreatePage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  fa = fa;
  ta = fa.appointments;
  tc = fa.common;
  ts = fa.servicesList;

  barbers = signal<Barber[]>([]);
  servicesAll = signal<Service[]>([]);
  get servicesFiltered(): Service[] {
    const bid = this.barberId;
    if (!bid) return this.servicesAll();
    return this.servicesAll().filter(s => s.barberId === bid);
  }

  barberId = '';
  serviceId = '';
  date = new Date().toISOString().slice(0, 10);
  todayIso = new Date().toISOString().slice(0, 10);
  slots = signal<{ startTime: string; endTime: string; status: string }[]>([]);
  slotReason = signal('');
  selectedSlot = signal<{ startTime: string; endTime: string; status: string } | null>(null);
  notes = '';

  loadingMeta = signal(true);
  loadingSlots = signal(false);
  creating = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  canCreate = () => !!this.barberId && !!this.serviceId && !!this.date && !!this.selectedSlot();

  ngOnInit() {
    this.loadMeta();
  }

  private loadMeta() {
    this.loadingMeta.set(true);
    let done = 0;
    const check = () => { done++; if (done >= 2) { this.loadingMeta.set(false); if (this.barberId && this.date) this.loadSlots(); } };
    this.api.barbers.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Barber[] : ((v as { data: Barber[] }).data ?? []);
        this.barbers.set(arr);
        if (arr.length && !this.barberId) this.barberId = arr[0].id;
        check();
      },
      error: () => check(),
    });
    this.api.services.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Service[] : ((v as { data: Service[] }).data ?? []);
        this.servicesAll.set(arr);
        if (arr.length && !this.serviceId) {
          const bid = this.barberId;
          const hit = bid ? arr.find(s => s.barberId === bid) : null;
          this.serviceId = (hit ?? arr[0]).id;
        }
        check();
      },
      error: () => check(),
    });
  }

  onBarberChange() {
    const bid = this.barberId;
    const all = this.servicesAll();
    const hit = all.find(s => s.barberId === bid);
    if (hit) this.serviceId = hit.id;
    this.selectedSlot.set(null);
    this.loadSlots();
  }

  loadSlots() {
    this.selectedSlot.set(null);
    this.slotReason.set('');
    if (!this.barberId || !this.date) { this.slots.set([]); return; }
    this.loadingSlots.set(true);
    const p: Record<string, string> = { barberId: this.barberId, date: this.date };
    if (this.serviceId) p['serviceId'] = this.serviceId;
    this.api.appointments.slots(p).subscribe({
      next: (v) => {
        const r = v as { slots?: { startTime: string; endTime: string; status: string }[]; reason?: string };
        this.slots.set(r.slots ?? []);
        this.slotReason.set(r.reason ?? '');
        this.loadingSlots.set(false);
      },
      error: () => { this.slots.set([]); this.loadingSlots.set(false); },
    });
  }

  isBooked(s: { status: string }) {
    const st = (s.status ?? '').toLowerCase();
    return st === 'booked' || st === 'reserved';
  }
  timeLabel(s: { startTime: string; endTime: string }) {
    return `${s.startTime.slice(11, 16)} - ${s.endTime.slice(11, 16)}`;
  }
  pick(s: { startTime: string; endTime: string; status: string }) {
    if (this.isBooked(s)) return;
    this.selectedSlot.set(s);
  }

  create() {
    if (this.creating() || !this.canCreate()) return;
    const sl = this.selectedSlot()!;
    this.errorMsg.set(''); this.successMsg.set('');
    this.creating.set(true);
    this.api.appointments.create({
      barberId: this.barberId,
      serviceId: this.serviceId,
      date: this.date,
      startTime: sl.startTime,
      endTime: sl.endTime,
      notes: this.notes || undefined,
    }).subscribe({
      next: () => {
        this.toast.success(fa.appointments.createSuccess);
        this.successMsg.set(fa.appointments.createSuccess);
        this.creating.set(false);
        setTimeout(() => this.router.navigateByUrl('/tabs/appointment'), 600);
      },
      error: (e) => {
        const msg = (e?.error as { message?: string | string[] })?.message;
        const text = Array.isArray(msg) ? msg.join('، ') : (msg ?? fa.common.failed);
        this.errorMsg.set(text);
        this.toast.error(text);
        this.creating.set(false);
      },
    });
  }
}

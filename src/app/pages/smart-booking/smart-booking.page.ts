import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Barber, Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { jalaliFa, todayTehranYMD, tehranYMD } from '../../core/utils/persian-date';
import { UiDatepickerComponent } from '../../shared/ui/ui';
import { extractMessage } from '../../core/utils/error';

interface Suggestion {
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-smart-booking',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonSpinner, UiDatepickerComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap smart-wrap" dir="rtl">
        <div class="head">
          <h1>{{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
        </div>
        <div class="dark-card form-card">
          <label class="lbl">{{ t.service }}</label>
          <select [(ngModel)]="serviceId" class="sel">
            <option value="">{{ t.any }}</option>
            @for (s of services(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
          </select>
          <label class="lbl">{{ t.barber }}</label>
          <select [(ngModel)]="barberId" class="sel">
            <option value="">{{ t.any }}</option>
            @for (b of barbers(); track b.id) { <option [value]="b.id">{{ b.fullName }}</option> }
          </select>
          <div class="row2">
            <div><label class="lbl">{{ t.from }}</label><app-ui-datepicker [(ngModel)]="dateFrom" [min]="todayIso" /></div>
            <div><label class="lbl">{{ t.to }}</label><app-ui-datepicker [(ngModel)]="dateTo" [min]="dateFrom || todayIso" /></div>
          </div>
          <label class="lbl">{{ t.preferredTime }}</label>
          <select [(ngModel)]="preferredTime" class="sel">
            <option value="">{{ t.any }}</option>
            <option value="morning">{{ t.morning }}</option>
            <option value="afternoon">{{ t.afternoon }}</option>
            <option value="evening">{{ t.evening }}</option>
          </select>
          <button type="button" class="cta" (click)="suggest()" [disabled]="loading()">
            @if (loading()) { <ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner> }
            @else { {{ t.findSlots }} }
          </button>
        </div>
        @if (loading() && !items().length) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
        } @else if (errorMsg()) {
          <div class="dark-card" style="text-align:center;padding:20px"><p style="color:#ef4444;margin:0 0 10px">{{ errorMsg() }}</p><button type="button" class="cta" (click)="suggest()">{{ t.retry }}</button></div>
        } @else if (searched() && !items().length) {
          <div class="dark-card" style="text-align:center;padding:22px"><p class="muted" style="margin:0">{{ t.empty }}</p></div>
        } @else if (items().length) {
          <div class="sug-list">
            @for (s of items(); track s.startTime + s.barberId) {
              <div class="sug-card">
                <div class="sug-top"><b>{{ s.barberName }}</b><small>{{ s.serviceName }} · {{ s.duration }} {{ ts.minute }}</small></div>
                <div class="sug-meta"><span dir="ltr">{{ s.time }}</span><span>{{ dateFa(s.date) }}</span><b>{{ priceFa(s.price) }} {{ ts.currency }}</b></div>
                <a class="cta-sm" routerLink="/tabs/booking" [queryParams]="{ barberId: s.barberId, serviceId: s.serviceId, date: s.date, time: s.time }">{{ t.book }}</a>
              </div>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .smart-wrap { gap:14px; padding-top:14px; max-width:640px; }
    .head { text-align:right; }
    .head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .head p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .form-card { display:flex; flex-direction:column; gap:10px; padding:14px; }
    .lbl { font-size:11px; font-weight:700; color:var(--text-primary); text-align:right; }
    .sel { width:100%; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:10px 12px; color:var(--text-primary); font-family:inherit; font-size:13px; outline:none; }
    .row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .cta { width:100%; min-height:46px; border:none; border-radius:10px; background:var(--accent); color:var(--accent-contrast); font-size:13px; font-weight:800; font-family:inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:12px; }
    .cta:disabled { opacity:0.55; cursor:default; }
    .sug-list { display:flex; flex-direction:column; gap:10px; width:100%; }
    .sug-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:8px; }
    .sug-top { display:flex; flex-direction:column; gap:3px; text-align:right; }
    .sug-top b { font-size:13px; color:var(--text-primary); }
    .sug-top small { font-size:11px; color:var(--text-secondary); }
    .sug-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12px; color:var(--text-primary); }
    .cta-sm { display:inline-flex; align-items:center; justify-content:center; background:var(--accent); color:var(--accent-contrast); border-radius:10px; padding:10px 14px; font-size:12px; font-weight:800; text-decoration:none; }
  `],
})
export class SmartBookingPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  fa = fa;
  t = fa.smartBooking;
  ts = fa.servicesList;
  barbers = signal<Barber[]>([]);
  services = signal<Service[]>([]);
  items = signal<Suggestion[]>([]);
  loading = signal(false);
  searched = signal(false);
  errorMsg = signal('');
  serviceId = '';
  barberId = '';
  todayIso = todayTehranYMD();
  dateFrom = todayTehranYMD();
  dateTo = tehranYMD(new Date(Date.now() + 6 * 86400000));
  preferredTime = '';
  ngOnInit() {
    this.api.barbers.list().subscribe({ next: (v) => this.barbers.set(Array.isArray(v) ? v as Barber[] : ((v as { data: Barber[] }).data ?? [])), error: () => {} });
    this.api.services.list().subscribe({ next: (v) => this.services.set(Array.isArray(v) ? v as Service[] : ((v as { data: Service[] }).data ?? [])), error: () => {} });
    this.suggest();
  }
  suggest() {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set('');
    const p: Record<string, string> = { dateFrom: this.dateFrom, dateTo: this.dateTo, limit: '6' };
    if (this.serviceId) p['serviceId'] = this.serviceId;
    if (this.barberId) p['barberId'] = this.barberId;
    if (this.preferredTime) p['preferredTime'] = this.preferredTime;
    this.api.appointments.smartSuggestions(p).subscribe({
      next: (v) => { this.items.set(v.suggestions ?? []); this.searched.set(true); this.loading.set(false); },
      error: (e) => { this.errorMsg.set(extractMessage(e, fa.common.failed)); this.loading.set(false); this.toast.error(extractMessage(e, fa.common.failed)); },
    });
  }
  dateFa(iso: string) {
    try { return jalaliFa(iso); } catch { return iso; }
  }
  priceFa(n: number) {
    try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); }
  }
}

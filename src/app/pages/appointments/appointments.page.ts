import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Barber, Service } from '../../core/models';

interface DayOpt { iso: string; title: string; sub: string; }
interface TimeSlot { time: string; fa: string; disabled?: boolean; }

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap choose-wrap" dir="rtl">
        <div class="choose-head">
          <h1>انتخاب زمان</h1>
          <p>{{ subTitle() }}</p>
        </div>

        <div class="days-row" role="tablist" aria-label="انتخاب روز">
          @for (d of days(); track d.iso) {
            <button
              type="button"
              class="day-chip"
              [class.selected]="selectedDayIso() === d.iso"
              role="tab"
              [attr.aria-selected]="selectedDayIso() === d.iso"
              (click)="selectDay(d.iso)"
            >
              <b>{{ d.title }}</b>
              <small>{{ d.sub }}</small>
            </button>
          }
        </div>

        @if (loadingSlots()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
        } @else {
          <div class="slots-card">
            <div class="slots-grid">
              @for (s of slots(); track s.time) {
                <button
                  type="button"
                  class="slot-btn"
                  [class.selected]="selectedTime() === s.time"
                  [class.disabled]="s.disabled"
                  [disabled]="!!s.disabled"
                  (click)="pick(s.time)"
                >
                  {{ s.fa }}
                </button>
              }
            </div>
          </div>
        }

        <button
          type="button"
          class="cta-btn"
          [disabled]="!selectedTime()"
          [class.disabled]="!selectedTime()"
          (click)="continue()"
        >
          @if (selectedTime()) {
            ادامه با ساعت {{ selectedTimeFa() }}
          } @else {
            انتخاب زمان
          }
        </button>

        @if (errorMsg()) {
          <div class="alert-error" style="text-align:center">{{ errorMsg() }}</div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .choose-wrap { gap: 18px; padding-top: 14px; max-width: 760px; }
    .choose-head { text-align: right; }
    .choose-head h1 { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
    .choose-head p { margin: 6px 0 0; font-size: 11px; color: var(--text-secondary); }
    .days-row {
      display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px;
      scrollbar-width: none; -ms-overflow-style: none;
      justify-content: flex-start;
    }
    .days-row::-webkit-scrollbar { display: none; }
    .day-chip {
      min-width: 74px; flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      padding: 10px 10px 8px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text-primary);
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      font-family: inherit;
    }
    .day-chip b { font-size: 11px; font-weight: 800; white-space: nowrap; line-height: 1.2; }
    .day-chip small { font-size: 10px; font-weight: 600; color: var(--text-secondary); line-height: 1; }
    .day-chip.selected {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-contrast);
    }
    .day-chip.selected small { color: var(--accent-contrast); opacity: 0.9; }
    .day-chip:active { transform: scale(0.98); }
    .slots-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 12px;
      box-sizing: border-box;
      width: 100%;
    }
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      direction: rtl;
    }
    @media (max-width: 560px) { .slots-grid { gap: 8px; } }
    @media (max-width: 380px) { .slots-grid { grid-template-columns: repeat(2, 1fr); } }
    .slot-btn {
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--card-border-2, var(--card-border));
      background: transparent;
      color: var(--text-primary);
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
      direction: ltr;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .slot-btn.selected {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-contrast);
    }
    .slot-btn.disabled {
      opacity: 0.38;
      cursor: default;
      color: var(--text-muted);
    }
    .slot-btn:not(.disabled):active { transform: scale(0.98); }
    .cta-btn {
      width: 100%;
      min-height: 48px;
      border: none;
      border-radius: 10px;
      background: var(--accent);
      color: var(--accent-contrast);
      font-size: 13px;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      padding: 12px 16px;
      box-sizing: border-box;
      transition: opacity 0.15s, transform 0.1s;
    }
    .cta-btn.disabled,
    .cta-btn:disabled {
      opacity: 0.95;
      cursor: pointer;
    }
    .cta-btn:not(:disabled):active { transform: scale(0.99); }
    .cta-btn:disabled { opacity: 0.6; cursor: default; }
    @media (min-width: 640px) {
      .choose-wrap { gap: 20px; padding-top: 18px; }
      .choose-head h1 { font-size: 26px; }
    }
  `],
})
export class AppointmentsPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  days = signal<DayOpt[]>([]);
  selectedDayIso = signal<string>('');
  selectedTime = signal<string>('');
  slots = signal<TimeSlot[]>([]);
  loadingSlots = signal(false);
  errorMsg = signal('');

  barber = signal<Barber | null>(null);
  service = signal<Service | null>(null);

  selectedTimeFa = computed(() => this.toFa(this.selectedTime()));
  subTitle = computed(() => {
    const b = this.barber()?.fullName ?? 'رضا کاظمی';
    const s = this.service()?.name ?? 'کوتاهی و استایل';
    return `${b} ، ${s}`;
  });

  private staticTimes = ['10:00','10:45','11:30','12:15','14:30','15:15','16:00','17:30','18:15','19:00','20:30','21:00'];

  ngOnInit() {
    this.buildDays();
    const qp = this.route.snapshot.queryParamMap;
    const qd = qp.get('date');
    const qt = qp.get('time') ?? qp.get('startTime');
    if (qd && this.days().some(d => d.iso === qd)) this.selectedDayIso.set(qd);
    if (qt) this.selectedTime.set(qt);
    const bid = qp.get('barberId');
    const sid = qp.get('serviceId');
    if (bid) this.api.barbers.get(bid).subscribe({ next: v => this.barber.set(v as Barber) });
    else this.fetchFirstBarber();
    if (sid) this.api.services.get(sid).subscribe({ next: v => this.service.set(v as Service) });
    else this.fetchFirstService();
    this.loadSlots();
  }

  buildDays() {
    const list: DayOpt[] = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      let wd = '';
      let dayNum = '';
      let month = '';
      try {
        wd = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(d);
        dayNum = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(d);
        month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(d);
      } catch {
        wd = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'][d.getDay()] ?? '';
        dayNum = String(d.getDate());
        month = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][d.getMonth()] ?? '';
      }
      const title = i === 0 ? `امروز ${dayNum}` : `${wd} ${dayNum}`;
      list.push({ iso, title, sub: month });
    }
    this.days.set(list);
    if (!this.selectedDayIso() && list.length) {
      this.selectedDayIso.set(list[0].iso);
    }
  }

  fetchFirstBarber() {
    this.api.barbers.list().subscribe({
      next: v => {
        const arr = Array.isArray(v) ? v : ((v as { data: Barber[] }).data ?? []);
        if (arr.length && !this.barber()) { this.barber.set(arr[0] as Barber); this.loadSlots(); }
      },
    });
  }

  fetchFirstService() {
    this.api.services.list().subscribe({
      next: v => {
        const arr = Array.isArray(v) ? v : ((v as { data: Service[] }).data ?? []);
        if (arr.length && !this.service()) { this.service.set(arr[0] as Service); }
      },
    });
  }

  selectDay(iso: string) {
    this.selectedDayIso.set(iso);
    this.loadSlots();
  }

  pick(t: string) { this.selectedTime.set(t); }

  toFa(en: string) {
    if (!en) return '';
    const map: Record<string,string> = {'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};
    return en.replace(/[0-9]/g, d => map[d] ?? d);
  }

  loadSlots() {
    const iso = this.selectedDayIso();
    const bid = this.barber()?.id ?? this.route.snapshot.queryParamMap.get('barberId') ?? '';
    if (bid && iso) {
      this.loadingSlots.set(true);
      const p: Record<string,string> = { barberId: bid, date: iso };
      const sid = this.service()?.id ?? this.route.snapshot.queryParamMap.get('serviceId') ?? '';
      if (sid) p['serviceId'] = sid;
      this.api.appointments.slots(p).subscribe({
        next: v => {
          const raw = (v as { slots?: unknown[] })?.slots ?? v;
          const arr = Array.isArray(raw) ? raw : [];
          if (arr.length) {
            const mapped: TimeSlot[] = (arr as { startTime: string; status?: string }[]).map(s => ({
              time: s.startTime,
              fa: this.toFa(s.startTime),
              disabled: s.status ? s.status !== 'available' && s.status !== 'free' : false,
            }));
            this.slots.set(mapped);
          } else {
            this.setFallbackSlots();
          }
          this.loadingSlots.set(false);
        },
        error: () => { this.setFallbackSlots(); this.loadingSlots.set(false); },
      });
    } else {
      this.setFallbackSlots();
    }
  }

  setFallbackSlots() {
    this.slots.set(this.staticTimes.map(t => ({ time: t, fa: this.toFa(t) })));
    if (!this.selectedTime() && this.slots().length) {
      const pref = this.slots().find(s => s.time === '10:45');
      if (pref) this.selectedTime.set(pref.time);
    }
  }

  continue() {
    const t = this.selectedTime();
    if (!t) return;
    this.errorMsg.set('');
    const iso = this.selectedDayIso();
    const bid = this.barber()?.id ?? this.route.snapshot.queryParamMap.get('barberId') ?? '';
    const sid = this.service()?.id ?? this.route.snapshot.queryParamMap.get('serviceId') ?? '';
    const qp: Record<string,string> = { date: iso, startTime: t, time: t };
    if (bid) qp['barberId'] = bid;
    if (sid) qp['serviceId'] = sid;
    this.router.navigate(['/tabs/booking'], { queryParams: qp });
  }
}

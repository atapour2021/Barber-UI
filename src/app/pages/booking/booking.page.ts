import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { Barber, Service } from '../../core/models';

type DayKey = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
interface DayRow {
  key: DayKey;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
}
const DAY_DEFS: { key: DayKey; label: string }[] = [
  { key: 'saturday', label: 'شنبه' },
  { key: 'sunday', label: 'یکشنبه' },
  { key: 'monday', label: 'دوشنبه' },
  { key: 'tuesday', label: 'سه‌شنبه' },
  { key: 'wednesday', label: 'چهارشنبه' },
  { key: 'thursday', label: 'پنجشنبه' },
  { key: 'friday', label: 'جمعه' },
];
const DEFAULT_START = '10:00';
const DEFAULT_END = '21:00';
const DEFAULT_BREAK_S = '14';
const DEFAULT_BREAK_E = '15';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      @if (isBarber()) {
        <div class="page-wrap schedule-wrap" dir="rtl">
          <div class="schedule-head">
            <h1>برنامه کاری</h1>
            <p>ساعات حضور و ظرفیت روزانه</p>
          </div>

          @if (loadingSchedule()) {
            <div class="dark-card" style="text-align:center;padding:22px"><ion-spinner></ion-spinner></div>
          } @else {
            <div class="days-list">
              @for (d of days(); track d.key) {
                <div class="day-card" [class.off]="!d.enabled">
                  <div class="day-text">
                    <b>{{ d.label }}</b>
                    @if (d.enabled) {
                      <small>{{ faTime(d.start) }} تا {{ faTime(d.end) }} &middot; استراحت {{ faNum(d.breakStart) }} تا {{ faNum(d.breakEnd) }}</small>
                    } @else {
                      <small class="off">تعطیل</small>
                    }
                  </div>
                  <button class="sw" type="button" role="switch" [attr.aria-checked]="d.enabled" [class.on]="d.enabled" (click)="toggle(d.key)" [attr.aria-label]="d.label">
                    <span class="knob"></span>
                  </button>
                </div>
              }
            </div>

            @if (saveError()) { <div class="alert-error" style="text-align:center">{{ saveError() }}</div> }
            @if (saveOk()) { <div class="alert-ok" style="text-align:center">{{ saveOk() }}</div> }

            <button class="save-btn" type="button" [disabled]="saving()" (click)="save()">
              @if (saving()) { <ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner> }
              @else { ذخیره برنامه }
            </button>
          }
        </div>
      } @else {
        <div class="page-wrap reserve-wrap" dir="rtl">
          <div class="reserve-head">
            <h1>مرور و تأیید رزرو</h1>
            <p>اطلاعات نوبت خود را بررسی کنید</p>
          </div>
          @if (loading()) {
            <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
          } @else {
            <div class="reserve-card barber-card">
              <img [src]="avatar()" (error)="onImgError($event)" alt="" />
              <div class="barber-text">
                <b>{{ barberName() }}</b>
                <small>{{ branch() }}</small>
              </div>
            </div>
            <div class="reserve-card details-card">
              <div class="detail-row"><span class="detail-val">{{ serviceName() }}</span><span class="detail-label">خدمت</span></div>
              <div class="detail-row"><span class="detail-val">{{ dateLabel() }}</span><span class="detail-label">تاریخ</span></div>
              <div class="detail-row"><span class="detail-val" dir="ltr">{{ timeLabel() }}</span><span class="detail-label">ساعت</span></div>
              <div class="detail-row"><span class="detail-val">{{ duration() }} دقیقه</span><span class="detail-label">مدت</span></div>
              <div class="detail-row total-row"><span class="detail-val price">{{ formatPrice(price()) }} تومان</span><span class="detail-label">مبلغ قابل پرداخت</span></div>
            </div>
            <div class="note-section">
              <label class="note-label">توضیحات برای آرایشگر</label>
              <textarea class="note-input" [(ngModel)]="note" placeholder="اختیاری" rows="2"></textarea>
            </div>
            @if (errorMsg()) { <div class="alert-error" style="text-align:center">{{ errorMsg() }}</div> }
            @if (successMsg()) { <div class="alert-ok" style="text-align:center">{{ successMsg() }}</div> }
            <button class="confirm-btn" type="button" [disabled]="confirming()" (click)="confirm()">
              @if (confirming()) { <ion-spinner name="crescent" style="--color:#0b101e"></ion-spinner> }
              @else { تأیید و رزرو نهایی }
            </button>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .schedule-wrap { gap: 14px; padding-top: 10px; max-width: 520px; }
    .schedule-head { text-align:right; }
    .schedule-head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .schedule-head p { margin:4px 0 0; font-size:11px; color:var(--text-secondary); }
    .days-list { display:flex; flex-direction:column; gap:10px; width:100%; }
    .day-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 13px 14px;
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      width:100%; box-sizing:border-box;
      transition: border-color 0.15s;
    }
    .day-card.off { opacity:0.95; }
    .day-text { display:flex; flex-direction:column; gap:4px; text-align:right; flex:1; min-width:0; }
    .day-text b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .day-text small { font-size:11px; color:var(--text-secondary); line-height:1.4; }
    .day-text small.off { color:var(--text-muted); }
    .sw {
      width:42px; height:24px; border-radius:999px;
      background:#1e293b;
      border:1px solid #334155;
      position:relative; cursor:pointer; flex-shrink:0;
      transition: background 0.18s, border-color 0.18s;
      padding:0;
    }
    .sw.on { background:var(--accent); border-color:var(--accent); }
    .sw .knob {
      position:absolute; top:2px; right:2px;
      width:16px; height:16px; border-radius:999px; background:#fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
      transition: transform 0.18s;
    }
    .sw.on .knob { transform: translateX(-16px); }
    html:not(.ion-palette-dark) .sw { background:#e2e8f0; border-color:#cbd5e1; }
    html:not(.ion-palette-dark) .sw.on { background:var(--accent); border-color:var(--accent); }
    .save-btn {
      width:100%; box-sizing:border-box;
      background:var(--accent); color:var(--accent-contrast);
      border:none; border-radius:10px; padding:13px 16px;
      font-size:13px; font-weight:800; font-family:inherit;
      cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-height:44px;
      transition: opacity 0.15s, transform 0.1s;
    }
    .save-btn:active { transform:scale(0.99); }
    .save-btn:disabled { opacity:0.7; cursor:default; }
    .reserve-wrap { gap: 14px; padding-top: 12px; max-width: 520px; }
    .reserve-head { text-align:right; }
    .reserve-head h1 { margin:0; font-size:20px; font-weight:800; color:var(--text-primary); }
    .reserve-head p { margin:6px 0 2px; font-size:11px; color:var(--text-secondary); }
    .reserve-card { background: var(--card-bg); border:1px solid var(--card-border); border-radius:12px; width:100%; box-sizing:border-box; }
    .barber-card { display:flex; align-items:center; gap:12px; padding:14px; }
    .barber-card img { width:44px; height:44px; border-radius:10px; object-fit:cover; background:#1e2a44; flex-shrink:0; }
    .barber-text { display:flex; flex-direction:column; gap:3px; text-align:right; min-width:0; }
    .barber-text b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .barber-text small { font-size:11px; color:var(--text-secondary); }
    .details-card { padding:6px 14px; display:flex; flex-direction:column; }
    .detail-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 0; }
    .detail-row + .detail-row { border-top:1px solid rgba(255,255,255,0.04); }
    .detail-label { font-size:11px; color:var(--text-secondary); flex-shrink:0; }
    .detail-val { font-size:12px; font-weight:700; color:var(--text-primary); text-align:left; }
    .total-row { border-top:1px solid var(--card-border) !important; margin-top:2px; }
    .detail-val.price { color:var(--accent); font-weight:800; }
    .note-section { display:flex; flex-direction:column; gap:8px; width:100%; }
    .note-label { font-size:12px; font-weight:700; color:var(--text-primary); text-align:right; }
    .note-input { width:100%; box-sizing:border-box; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:12px 14px; color:var(--text-primary); font-size:13px; font-family:inherit; outline:none; resize:vertical; min-height:44px; }
    .note-input::placeholder { color:var(--text-muted); }
    .confirm-btn { width:100%; box-sizing:border-box; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:10px; padding:14px 16px; font-size:14px; font-weight:800; font-family:inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-height:48px; }
    .confirm-btn:disabled { opacity:0.7; }
  `],
})
export class BookingPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private viewRole = inject(ViewRoleService);
  private auth = inject(AuthService);

  isBarber = computed(() => this.viewRole.activeView() === 'barber');

  loadingSchedule = signal(true);
  saving = signal(false);
  saveError = signal('');
  saveOk = signal('');
  days = signal<DayRow[]>(DAY_DEFS.map((d, i) => ({
    key: d.key,
    label: d.label,
    enabled: i < 5,
    start: DEFAULT_START,
    end: DEFAULT_END,
    breakStart: DEFAULT_BREAK_S,
    breakEnd: DEFAULT_BREAK_E,
  })));
  private barberId = signal<string | null>(null);

  loading = signal(false);
  confirming = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  note = '';
  barber = signal<Barber | null>(null);
  service = signal<Service | null>(null);
  dateIso = signal(new Date().toISOString().slice(0, 10));
  timeStart = signal('14:30');
  dateLabel = signal('شنبه، ۲۹ شهریور');
  timeLabel = computed(() => this.timeStart());
  barberName = computed(() => this.barber()?.fullName ?? 'رضا کاظمی');
  branch = computed(() => this.barber()?.barbershop?.name ?? (this.barber() as unknown as { barbershopName?: string })?.barbershopName ?? 'شعبه سعادت‌آباد');
  avatar = computed(() => this.barber()?.profileImage ?? 'https://i.pravatar.cc/150?u=reza-kazemi');
  serviceName = computed(() => this.service()?.name ?? 'کوتاهی و استایل');
  price = computed(() => this.service()?.price ?? 250000);
  duration = computed(() => this.service()?.duration ?? 45);

  ngOnInit() {
    if (this.isBarber()) this.loadSchedule();
    this.initReserve();
  }

  private loadSchedule() {
    this.loadingSchedule.set(true);
    const applyBarber = (b: Barber) => {
      this.barberId.set(b.id);
      const wd = (b.workingDays ?? null) as string[] | null;
      const wh = b.workingHours as Record<string, { start: string; end: string }> | null | undefined;
      const bt = b.breakTime as unknown as Record<string, { start: string; end: string }> | { start: string; end: string } | null | undefined;
      this.days.update(arr => arr.map(d => {
        const enabled = wd ? wd.includes(d.key) || wd.includes(d.label) : d.enabled;
        const hit = wh?.[d.key] ?? (wh as Record<string, { start: string; end: string }>)?.[d.label];
        let bs = DEFAULT_BREAK_S, be = DEFAULT_BREAK_E;
        if (bt) {
          if ((bt as Record<string, { start: string; end: string }>)[d.key]) { const x = (bt as Record<string, { start: string; end: string }>)[d.key]; bs = x.start?.slice(0,2) ?? bs; be = x.end?.slice(0,2) ?? be; }
          else if ((bt as { start: string; end: string }).start) { bs = (bt as { start: string; end: string }).start.slice(0,2); be = (bt as { start: string; end: string }).end.slice(0,2); }
        }
        return {
          ...d,
          enabled,
          start: hit?.start ?? d.start,
          end: hit?.end ?? d.end,
          breakStart: bs,
          breakEnd: be,
        };
      }));
      this.loadingSchedule.set(false);
    };
    this.api.barbers.me().subscribe({
      next: (b) => applyBarber(b as Barber),
      error: () => {
        this.api.barbers.list().subscribe({
          next: (v) => {
            const arr = Array.isArray(v) ? v as Barber[] : [];
            const uid = this.auth.user()?.id;
            const found = arr.find(x => x.userId === uid) ?? arr[0];
            if (found) applyBarber(found);
            else this.loadingSchedule.set(false);
          },
          error: () => this.loadingSchedule.set(false),
        });
      },
    });
  }

  toggle(key: DayKey) {
    this.days.update(arr => arr.map(d => d.key === key ? { ...d, enabled: !d.enabled } : d));
  }

  save() {
    if (this.saving()) return;
    this.saveError.set('');
    this.saveOk.set('');
    this.saving.set(true);
    const rows = this.days();
    const workingDays = rows.filter(r => r.enabled).map(r => r.key);
    const workingHours: Record<string, { start: string; end: string }> = {};
    for (const r of rows) if (r.enabled) workingHours[r.key] = { start: r.start, end: r.end };
    const id = this.barberId();
    const payload: Record<string, unknown> = { workingDays, workingHours };
    const obs = id ? this.api.barbers.update(id, payload) : this.api.barbers.create(payload);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.saveOk.set('برنامه ذخیره شد');
        this.toast.success('برنامه ذخیره شد');
      },
      error: (err) => {
        this.saving.set(false);
        const msg = (err?.error as { message?: string })?.message ?? 'ذخیره ناموفق بود';
        this.saveError.set(msg);
        this.toast.error(msg);
      },
    });
  }

  faTime(t: string) {
    return this.faNum(t);
  }
  faNum(s: string) {
    try {
      return s.replace(/[0-9]/g, d => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][+d]);
    } catch { return s; }
  }

  private initReserve() {
    const qp = this.route.snapshot.queryParamMap;
    const sid = qp.get('serviceId');
    const bid = qp.get('barberId');
    const d = qp.get('date');
    const st = qp.get('startTime') ?? qp.get('time');
    if (d) { this.dateIso.set(d); this.dateLabel.set(this.toFaDateLabel(d)); }
    if (st) this.timeStart.set(st);
    if (!sid && !bid && !this.isBarber()) {
      this.loading.set(false);
      if (!sid) this.fetchFirstService();
      if (!bid) this.fetchFirstBarber();
      return;
    }
    this.loading.set(true);
    let pending = 0;
    const done = () => { pending--; if (pending <= 0) this.loading.set(false); };
    if (sid) {
      pending++;
      this.api.services.get(sid).subscribe({ next: (v) => { this.service.set(v as Service); done(); }, error: () => done() });
    } else this.fetchFirstService();
    if (bid) {
      pending++;
      this.api.barbers.get(bid).subscribe({ next: (v) => { this.barber.set(v as Barber); done(); }, error: () => done() });
    } else this.fetchFirstBarber();
    if (pending === 0) this.loading.set(false);
  }

  fetchFirstService() {
    this.api.services.list().subscribe({ next: (v) => { const arr = Array.isArray(v) ? v : ((v as { data: Service[] }).data ?? []); if (arr.length && !this.service()) this.service.set(arr[0] as Service); } });
  }
  fetchFirstBarber() {
    this.api.barbers.list().subscribe({ next: (v) => { const arr = Array.isArray(v) ? v : ((v as { data: Barber[] }).data ?? []); if (arr.length && !this.barber()) this.barber.set(arr[0] as Barber); } });
  }
  formatPrice(n: number) { try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); } }
  toFaDateLabel(iso: string) { try { const d = new Date(iso + 'T12:00:00'); return new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); } catch { return iso; } }
  calcEnd(start: string, mins: number) { const [h, m] = start.split(':').map(Number); const total = h * 60 + m + mins; const hh = String(Math.floor(total / 60) % 24).padStart(2, '0'); const mm = String(total % 60).padStart(2, '0'); return `${hh}:${mm}`; }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=fallback'; }
  confirm() {
    if (this.confirming()) return;
    this.errorMsg.set(''); this.successMsg.set('');
    const barberId = this.barber()?.id ?? this.route.snapshot.queryParamMap.get('barberId') ?? '';
    const serviceId = this.service()?.id ?? this.route.snapshot.queryParamMap.get('serviceId') ?? '';
    if (!barberId || !serviceId) { this.errorMsg.set('آرایشگر یا خدمت انتخاب نشده'); this.toast.warning('آرایشگر یا خدمت انتخاب نشده'); return; }
    const date = this.dateIso(); const startTime = this.timeStart(); const endTime = this.calcEnd(startTime, this.duration());
    this.confirming.set(true);
    this.api.appointments.create({ barberId, serviceId, date, startTime, endTime, notes: this.note }).subscribe({
      next: () => { this.confirming.set(false); this.successMsg.set('رزرو با موفقیت ثبت شد'); this.toast.success('رزرو با موفقیت ثبت شد'); setTimeout(() => this.router.navigateByUrl('/tabs/appointments'), 600); },
      error: (err) => { this.confirming.set(false); const msg = (err?.error as { message?: string })?.message ?? 'ثبت رزرو ناموفق بود'; this.errorMsg.set(msg); this.toast.error(msg); },
    });
  }
}

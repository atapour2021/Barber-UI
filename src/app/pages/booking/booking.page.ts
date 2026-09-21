import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Barber, Service } from '../../core/models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
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
            <div class="detail-row">
              <span class="detail-val">{{ serviceName() }}</span>
              <span class="detail-label">خدمت</span>
            </div>
            <div class="detail-row">
              <span class="detail-val">{{ dateLabel() }}</span>
              <span class="detail-label">تاریخ</span>
            </div>
            <div class="detail-row">
              <span class="detail-val" dir="ltr">{{ timeLabel() }}</span>
              <span class="detail-label">ساعت</span>
            </div>
            <div class="detail-row">
              <span class="detail-val">{{ duration() }} دقیقه</span>
              <span class="detail-label">مدت</span>
            </div>
            <div class="detail-row total-row">
              <span class="detail-val price">{{ formatPrice(price()) }} تومان</span>
              <span class="detail-label">مبلغ قابل پرداخت</span>
            </div>
          </div>

          <div class="note-section">
            <label class="note-label">توضیحات برای آرایشگر</label>
            <textarea
              class="note-input"
              [(ngModel)]="note"
              placeholder="اختیاری"
              rows="2"
            ></textarea>
          </div>

          @if (errorMsg()) {
            <div class="alert-error" style="text-align:center">{{ errorMsg() }}</div>
          }
          @if (successMsg()) {
            <div class="alert-ok" style="text-align:center">{{ successMsg() }}</div>
          }

          <button
            class="confirm-btn"
            type="button"
            [disabled]="confirming()"
            (click)="confirm()"
          >
            @if (confirming()) {
              <ion-spinner name="crescent" style="--color:#0b101e"></ion-spinner>
            } @else {
              تأیید و رزرو نهایی
            }
          </button>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .reserve-wrap { gap: 14px; padding-top: 12px; max-width: 520px; }
    .reserve-head { text-align:right; }
    .reserve-head h1 { margin:0; font-size:20px; font-weight:800; color:var(--text-primary); }
    .reserve-head p { margin:6px 0 2px; font-size:11px; color:var(--text-secondary); }
    .reserve-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      width: 100%;
      box-sizing: border-box;
    }
    .barber-card {
      display:flex;
      align-items:center;
      justify-content:flex-start;
      gap:12px;
      padding:14px;
    }
    .barber-card img {
      width:44px; height:44px; border-radius:10px; object-fit:cover;
      background:#1e2a44; flex-shrink:0;
    }
    .barber-text { display:flex; flex-direction:column; gap:3px; text-align:right; min-width:0; }
    .barber-text b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .barber-text small { font-size:11px; color:var(--text-secondary); }
    .details-card { padding: 6px 14px; display:flex; flex-direction:column; }
    .detail-row {
      display:flex; align-items:center; justify-content:space-between;
      gap:12px; padding:12px 0;
      border-bottom: 1px solid transparent;
    }
    .detail-row + .detail-row { border-top: 1px solid rgba(255,255,255,0.04); }
    .detail-label { font-size:11px; color:var(--text-secondary); flex-shrink:0; }
    .detail-val { font-size:12px; font-weight:700; color:var(--text-primary); text-align:left; }
    .total-row { border-top: 1px solid var(--card-border) !important; margin-top:2px; }
    .detail-val.price { color: var(--accent); font-weight:800; }
    .note-section { display:flex; flex-direction:column; gap:8px; width:100%; }
    .note-label { font-size:12px; font-weight:700; color:var(--text-primary); text-align:right; }
    .note-input {
      width:100%; box-sizing:border-box;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius:10px;
      padding:12px 14px;
      color: var(--text-primary);
      font-size:13px; font-family: inherit;
      outline:none; resize: vertical; min-height:44px;
    }
    .note-input::placeholder { color: var(--text-muted); }
    .note-input:focus { border-color: var(--card-border-2); }
    .confirm-btn {
      width:100%; box-sizing:border-box;
      background: var(--accent);
      color: var(--accent-contrast);
      border:none; border-radius:10px;
      padding:14px 16px;
      font-size:14px; font-weight:800; font-family: inherit;
      cursor:pointer; transition: opacity 0.15s, transform 0.1s;
      display:inline-flex; align-items:center; justify-content:center;
      min-height:48px;
    }
    .confirm-btn:active { transform: scale(0.99); }
    .confirm-btn:disabled { opacity:0.7; cursor:default; }
    @media(min-width:640px){
      .reserve-wrap { gap:16px; padding-top:16px; }
      .reserve-head h1 { font-size:22px; }
    }
  `],
})
export class BookingPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

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

  constructor() {}

  ngOnInit() {
    const qp = this.route.snapshot.queryParamMap;
    const sid = qp.get('serviceId');
    const bid = qp.get('barberId');
    const d = qp.get('date');
    const st = qp.get('startTime') ?? qp.get('time');
    if (d) {
      this.dateIso.set(d);
      this.dateLabel.set(this.toFaDateLabel(d));
    }
    if (st) this.timeStart.set(st);
    this.loading.set(true);
    let pending = 0;
    const done = () => { pending--; if (pending <= 0) this.loading.set(false); };
    if (sid) {
      pending++;
      this.api.services.get(sid).subscribe({
        next: (v) => { this.service.set(v as Service); done(); },
        error: () => done(),
      });
    }
    if (bid) {
      pending++;
      this.api.barbers.get(bid).subscribe({
        next: (v) => { this.barber.set(v as Barber); done(); },
        error: () => done(),
      });
    }
    if (pending === 0) {
      this.loading.set(false);
      if (!sid) this.fetchFirstService();
      if (!bid) this.fetchFirstBarber();
    } else {
      if (!sid) this.fetchFirstService();
      if (!bid) this.fetchFirstBarber();
    }
  }

  fetchFirstService() {
    this.api.services.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v : ((v as { data: Service[] }).data ?? []);
        if (arr.length && !this.service()) this.service.set(arr[0] as Service);
      },
    });
  }

  fetchFirstBarber() {
    this.api.barbers.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v : ((v as { data: Barber[] }).data ?? []);
        if (arr.length && !this.barber()) this.barber.set(arr[0] as Barber);
      },
    });
  }

  formatPrice(n: number) {
    try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); }
  }

  toFaDateLabel(iso: string) {
    try {
      const d = new Date(iso + 'T12:00:00');
      return new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    } catch { return iso; }
  }

  calcEnd(start: string, mins: number) {
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + mins;
    const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=fallback';
  }

  confirm() {
    if (this.confirming()) return;
    this.errorMsg.set('');
    this.successMsg.set('');
    const barberId = this.barber()?.id ?? this.route.snapshot.queryParamMap.get('barberId') ?? '';
    const serviceId = this.service()?.id ?? this.route.snapshot.queryParamMap.get('serviceId') ?? '';
    if (!barberId || !serviceId) {
      this.errorMsg.set('آرایشگر یا خدمت انتخاب نشده');
      this.toast.warning('آرایشگر یا خدمت انتخاب نشده');
      return;
    }
    const date = this.dateIso();
    const startTime = this.timeStart();
    const endTime = this.calcEnd(startTime, this.duration());
    this.confirming.set(true);
    this.api.appointments.create({ barberId, serviceId, date, startTime, endTime, notes: this.note }).subscribe({
      next: () => {
        this.confirming.set(false);
        this.successMsg.set('رزرو با موفقیت ثبت شد');
        this.toast.success('رزرو با موفقیت ثبت شد');
        setTimeout(() => this.router.navigateByUrl('/tabs/appointments'), 600);
      },
      error: (err) => {
        this.confirming.set(false);
        const msg = (err?.error as { message?: string })?.message ?? 'ثبت رزرو ناموفق بود';
        this.errorMsg.set(msg);
        this.toast.error(msg);
      },
    });
  }
}

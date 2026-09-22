import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Appointment, Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap detail-wrap" dir="rtl">
        <div class="detail-head">
          <h1>جزئیات نوبت</h1>
          <span class="status-badge" [class.cancelled]="appt()?.status==='cancelled'">{{ statusLabel() }}</span>
        </div>

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ fa.common.loading }}</p></div>
        } @else if (!appt()) {
          <div class="dark-card" style="text-align:center;padding:20px"><p class="muted" style="margin:0">نوبت یافت نشد</p><button type="button" class="link-teal" (click)="back()" style="margin-top:10px;background:none;border:none;font:inherit;cursor:pointer">بازگشت</button></div>
        } @else {
          <div class="dark-card barber-row">
            <img [src]="avatar()" (error)="onImgError($event)" alt="" />
            <div class="barber-meta">
              <b>{{ barberName() }}</b>
              <small>آرایشگر ارشد</small>
            </div>
          </div>

          <div class="dark-card detail-card">
            <div class="d-row">
              <span class="d-label">خدمت</span>
              <b class="d-val">{{ serviceName() }}</b>
            </div>
            <div class="d-row">
              <span class="d-label">زمان</span>
              <b class="d-val">{{ timeLabel() }}</b>
            </div>
            <div class="d-row">
              <span class="d-label">مدت</span>
              <b class="d-val">{{ duration() }} دقیقه</b>
            </div>
            <div class="d-row">
              <span class="d-label">مبلغ</span>
              <b class="d-val price">{{ priceFa() }} تومان</b>
            </div>
          </div>

          <div class="dark-card address-card">
            <h3>آدرس</h3>
            <p class="addr">{{ address() }}</p>
            <a class="map-link" [href]="mapHref()" target="_blank" rel="noopener">نمایش روی نقشه</a>
          </div>

          <div class="actions">
            <button type="button" class="btn btn-contact" (click)="contact()">تماس با آرایشگاه</button>
            <button type="button" class="btn btn-cancel" (click)="cancelAppt()" [disabled]="cancelling()">{{ cancelling() ? 'در حال لغو...' : 'لغو نوبت' }}</button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .detail-wrap { gap: 12px; padding-top: 14px; max-width: 560px; }
    .detail-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .detail-head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .status-badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-size:10px; font-weight:700; background:rgba(34,197,94,0.16); color:#22c55e; border:1px solid rgba(34,197,94,0.28); line-height:1; }
    .status-badge.cancelled { background:rgba(239,68,68,0.14); color:#ef4444; border-color:rgba(239,68,68,0.25); }
    .barber-row { display:flex; align-items:center; justify-content:flex-start; gap:12px; padding:14px; }
    .barber-row img { width:52px; height:52px; border-radius:10px; object-fit:cover; background:#1e2a44; flex-shrink:0; }
    .barber-meta { display:flex; flex-direction:column; gap:3px; text-align:right; flex:1; }
    .barber-meta b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .barber-meta small { font-size:11px; color:var(--text-secondary); }
    .detail-card { display:flex; flex-direction:column; gap:0; padding:10px 14px; }
    .d-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid var(--card-border); }
    .d-row:last-child { border-bottom:none; }
    .d-label { font-size:11px; color:var(--text-secondary); font-weight:600; flex-shrink:0; }
    .d-val { font-size:12px; font-weight:700; color:var(--text-primary); text-align:left; direction:rtl; }
    .d-val.price { color:var(--accent); }
    .address-card { padding:14px; text-align:right; }
    .address-card h3 { margin:0 0 10px; font-size:12px; font-weight:800; color:var(--text-primary); }
    .addr { margin:0; font-size:11px; line-height:1.8; color:var(--text-primary); font-weight:600; }
    .map-link { display:inline-block; margin-top:10px; font-size:11px; font-weight:700; color:var(--accent); text-decoration:none; }
    .map-link:hover { text-decoration:underline; }
    .actions { display:flex; gap:10px; width:100%; margin-top:2px; }
    .actions .btn { flex:1; min-width:0; }
    @media (max-width: 360px) { .actions { flex-direction:column; } }
    .btn { min-height:44px; border-radius:10px; font-size:12px; font-weight:800; font-family:inherit; cursor:pointer; padding:10px 14px; display:inline-flex; align-items:center; justify-content:center; transition: opacity 0.15s, transform 0.1s; }
    .btn:active { transform:scale(0.99); }
    .btn-contact { background:var(--accent); color:var(--accent-contrast); border:1px solid var(--accent); }
    .btn-cancel { background:transparent; color:var(--text-primary); border:1px solid var(--card-border-2, var(--card-border)); }
    .btn-cancel:disabled { opacity:0.6; cursor:default; }
  `],
})
export class AppointmentDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  fa = fa;

  loading = signal(true);
  cancelling = signal(false);
  appt = signal<Appointment | null>(null);

  barberName = computed(() => this.appt()?.barber?.fullName ?? 'رضا کاظمی');
  serviceName = computed(() => this.appt()?.service?.name ?? 'کوتاهی و استایل');
  avatar = computed(() => (this.appt()?.barber as Barber | undefined)?.profileImage ?? 'https://i.pravatar.cc/150?u=reza');
  statusLabel = computed(() => {
    const s = this.appt()?.status;
    if (s === 'cancelled') return 'لغو شده';
    if (s === 'confirmed') return 'تایید شده';
    if (s === 'pending') return 'در انتظار';
    if (s === 'completed') return 'انجام شده';
    return 'تایید شده';
  });
  timeLabel = computed(() => {
    const a = this.appt();
    if (!a) return 'امروز، ساعت ۱۴:۳۰';
    const iso = a.date;
    const today = new Date().toISOString().slice(0, 10);
    const pref = iso === today ? 'امروز' : iso;
    let dayLabel = pref;
    if (iso !== today) {
      try { dayLabel = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(iso + 'T12:00:00')); } catch { dayLabel = iso; }
    }
    return `${dayLabel}، ساعت ${this.toFa(a.startTime)}`;
  });
  duration = computed(() => this.appt()?.service?.duration ?? 45);
  priceFa = computed(() => this.toFaNum(this.appt()?.service?.price ?? 350000));
  address = computed(() => {
    const loc = (this.appt()?.barber as unknown as { barbershop?: { address?: string } })?.barbershop?.address;
    if (loc) return loc;
    return 'سعادت‌آباد، بلوار دریا، مجتمع رویال، طبقه ۲';
  });
  mapHref = computed(() => {
    const addr = this.address();
    return `https://maps.google.com/?q=${encodeURIComponent(addr)}`;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.appt.set(this.fallback()); this.loading.set(false); return; }
    this.loading.set(true);
    this.api.appointments.get(id).subscribe({
      next: (v) => { this.appt.set(this.normalize(v as Appointment)); this.loading.set(false); },
      error: () => { this.appt.set(this.fallback(id)); this.loading.set(false); },
    });
  }

  normalize(a: Appointment): Appointment {
    if (a.barber && a.service) return a;
    const fb = this.fallback(a.id);
    return { ...fb, ...a, barber: (a.barber as Barber) ?? fb.barber, service: (a.service as never) ?? fb.service } as Appointment;
  }

  fallback(id = '1'): Appointment {
    return {
      id, date: new Date().toISOString().slice(0, 10), startTime: '14:30', endTime: '15:15', status: 'confirmed', notes: null, userId: '', barberId: 'b1', serviceId: 's1',
      barber: { id: 'b1', fullName: 'رضا کاظمی', profileImage: 'https://i.pravatar.cc/150?u=reza', status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '' } as Barber,
      service: { id: 's1', name: 'کوتاهی و استایل', price: 350000, duration: 45, barberId: '' } as never,
    };
  }

  toFa(s: string) {
    const m: Record<string,string> = {'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};
    return s.replace(/[0-9]/g, d => m[d] ?? d);
  }
  toFaNum(n: number) {
    try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return this.toFa(String(n)); }
  }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=fallback'; }
  back() { this.router.navigateByUrl('/tabs/appointment'); }
  contact() {
    const tel = (this.appt()?.barber as unknown as { barbershop?: { phoneNumber?: string } })?.barbershop?.phoneNumber ?? '';
    if (tel) window.open(`tel:${tel}`, '_self');
    else this.toast.info('شماره تماس ثبت نشده');
  }
  cancelAppt() {
    const a = this.appt();
    if (!a || a.status === 'cancelled') return;
    this.cancelling.set(true);
    this.api.appointments.cancel(a.id).subscribe({
      next: () => { this.appt.update(v => v ? { ...v, status: 'cancelled' } as Appointment : v); this.toast.success(fa.appointments.cancelSuccess); this.cancelling.set(false); },
      error: () => { this.toast.error(fa.common.failed); this.cancelling.set(false); },
    });
  }
}

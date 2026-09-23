import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { ToastService } from '../../core/services/toast.service';
import { Appointment, Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [FormsModule, IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap detail-wrap" dir="rtl">
        <div class="detail-head">
          <h1>جزئیات نوبت</h1>
          <span class="status-badge" [style.background]="badgeBg()" [style.border-color]="badgeBg()" [style.color]="'#fff'">{{ statusLabel() }}</span>
        </div>
        @if (isBarber()) { <p class="muted" style="margin:0;font-size:11px">نمای آرایشگر — تایید / رد / اتمام</p> }
        @else if (isAdmin()) { <p class="muted" style="margin:0;font-size:11px">نمای مدیر — مدیریت کامل</p> }

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ fa.common.loading }}</p></div>
        } @else if (!appt()) {
          <div class="dark-card" style="text-align:center;padding:20px"><p class="muted" style="margin:0">نوبت یافت نشد</p><button type="button" class="link-teal" (click)="back()" style="margin-top:10px;background:none;border:none;font:inherit;cursor:pointer;color:var(--accent)">بازگشت</button></div>
        } @else {
          <div class="dark-card barber-row">
            <img [src]="avatar()" (error)="onImgError($event)" alt="" />
            <div class="barber-meta">
              <b>{{ barberName() }}</b>
              <small>آرایشگر</small>
            </div>
          </div>

          @if (isBarber() || isAdmin()) {
            <div class="dark-card" style="padding:12px 14px;text-align:right">
              <small class="muted" style="font-size:11px">مشتری: {{ appt()?.user?.username ?? appt()?.userId?.slice(0,8) }} @if (appt()?.user?.phoneNumber) { · {{ appt()?.user?.phoneNumber }} }</small>
              @if (appt()?.user?.name) { <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-top:4px">{{ appt()?.user?.name }} {{ appt()?.user?.family }}</div> }
            </div>
          }

          <div class="dark-card detail-card">
            <div class="d-row"><span class="d-label">خدمت</span><b class="d-val">{{ serviceName() }}</b></div>
            <div class="d-row"><span class="d-label">تاریخ</span><b class="d-val">{{ dateFa() }}</b></div>
            <div class="d-row"><span class="d-label">زمان</span><b class="d-val" dir="ltr">{{ timeRange() }}</b></div>
            <div class="d-row"><span class="d-label">مدت</span><b class="d-val">{{ duration() }} دقیقه</b></div>
            <div class="d-row"><span class="d-label">مبلغ</span><b class="d-val price">{{ priceFa() }} تومان</b></div>
            @if (appt()?.notes) { <div class="d-row"><span class="d-label">یادداشت</span><b class="d-val" style="font-weight:600;max-width:60%;text-align:right;white-space:pre-wrap">{{ appt()?.notes }}</b></div> }
          </div>

          @if (editing()) {
            <div class="dark-card" style="padding:12px;display:flex;gap:8px;flex-direction:column">
              <label style="font-size:11px;font-weight:700;color:var(--text-primary);text-align:right">ویرایش یادداشت</label>
              <textarea [(ngModel)]="editNotes" rows="2" maxlength="500" placeholder="یادداشت" style="width:100%;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-family:inherit;outline:none;resize:vertical"></textarea>
              <div style="display:flex;gap:8px">
                <button type="button" class="btn btn-contact" style="flex:1" (click)="saveEdit()" [disabled]="saving()">ذخیره</button>
                <button type="button" class="btn btn-cancel" style="flex:1" (click)="editing.set(false)">انصراف</button>
              </div>
            </div>
          }

          <div class="dark-card address-card">
            <h3>آدرس</h3>
            <p class="addr">{{ address() }}</p>
            <a class="map-link" [href]="mapHref()" target="_blank" rel="noopener">نمایش روی نقشه</a>
          </div>

          <div class="actions">
            @if (isBarber() || isAdmin()) {
              @if (appt()?.status === 'pending') {
                <button type="button" class="btn btn-contact" (click)="doStatus('confirmed')" [disabled]="busy()">تایید</button>
                <button type="button" class="btn btn-cancel" (click)="doStatus('cancelled')" [disabled]="busy()">رد</button>
              } @else if (appt()?.status === 'confirmed') {
                <button type="button" class="btn btn-contact" (click)="doStatus('completed')" [disabled]="busy()">انجام شد</button>
                <button type="button" class="btn btn-cancel" (click)="doCancel()" [disabled]="busy()">لغو</button>
              } @else {
                <button type="button" class="btn btn-contact" (click)="contact()">تماس</button>
              }
            }
            @if (!isBarber()) {
              @if (appt()?.status !== 'cancelled' && appt()?.status !== 'completed' && appt()?.status !== 'no_show') {
                @if (!editing()) { <button type="button" class="btn btn-cancel" (click)="editing.set(true)">ویرایش یادداشت</button> }
                <button type="button" class="btn btn-cancel" (click)="doCancel()" [disabled]="busy()">{{ busy() ? '...' : 'لغو نوبت' }}</button>
              }
              <button type="button" class="btn btn-contact" (click)="contact()">تماس با آرایشگاه</button>
            }
          </div>

          @if (isAdmin()) {
            <div class="dark-card" style="padding:12px;display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" class="btn btn-cancel" style="flex:1;background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.3);color:#ef4444" (click)="doDelete()" [disabled]="busy()">حذف نوبت</button>
              <button type="button" class="btn btn-cancel" style="flex:1" (click)="back()">بازگشت</button>
            </div>
          }
          @if (!isAdmin() && !isBarber()) {
            <button type="button" class="link-teal" (click)="back()" style="background:none;border:none;color:var(--text-secondary);font:inherit;font-size:12px;cursor:pointer;text-align:center;width:100%">بازگشت به فهرست</button>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .detail-wrap { gap: 12px; padding-top: 14px; max-width: 560px; }
    .detail-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .detail-head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .status-badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-size:10px; font-weight:700; border:1px solid; line-height:1; }
    .barber-row { display:flex; align-items:center; gap:12px; padding:14px; }
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
    .actions { display:flex; gap:10px; width:100%; margin-top:2px; flex-wrap:wrap; }
    .actions .btn { flex:1; min-width:0; }
    @media (max-width: 360px) { .actions { flex-direction:column; } }
    .btn { min-height:44px; border-radius:10px; font-size:12px; font-weight:800; font-family:inherit; cursor:pointer; padding:10px 14px; display:inline-flex; align-items:center; justify-content:center; }
    .btn-contact { background:var(--accent); color:var(--accent-contrast); border:1px solid var(--accent); }
    .btn-contact:disabled,.btn-cancel:disabled { opacity:0.6; cursor:default; }
    .btn-cancel { background:transparent; color:var(--text-primary); border:1px solid var(--card-border-2, var(--card-border)); }
    .link-teal { color:var(--accent); }
  `],
})
export class AppointmentDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private viewRole = inject(ViewRoleService);
  private auth = inject(AuthService);
  fa = fa;

  loading = signal(true);
  busy = signal(false);
  saving = signal(false);
  editing = signal(false);
  editNotes = '';
  appt = signal<Appointment | null>(null);

  isBarber = computed(() => this.viewRole.activeView() === 'barber' || this.auth.isBarber());
  isAdmin = computed(() => this.viewRole.activeView() === 'admin' || this.auth.isAdmin());

  barberName = computed(() => this.appt()?.barber?.fullName ?? '—');
  serviceName = computed(() => this.appt()?.service?.name ?? '—');
  avatar = computed(() => (this.appt()?.barber as Barber | undefined)?.profileImage ?? 'https://i.pravatar.cc/150?u=fallback');
  duration = computed(() => this.appt()?.service?.duration ?? 0);
  priceFa = computed(() => { try { return new Intl.NumberFormat('fa-IR').format(this.appt()?.service?.price ?? 0); } catch { return String(this.appt()?.service?.price ?? 0); } });
  dateFa = computed(() => { const d = this.appt()?.date?.slice(0,10) ?? ''; if (!d) return '—'; try { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(d + 'T12:00:00')); } catch { return d; } });
  timeRange = computed(() => { const a = this.appt(); if (!a) return '—'; const s = a.startTime.includes('T') ? a.startTime.slice(11,16) : a.startTime; const e = a.endTime.includes('T') ? a.endTime.slice(11,16) : a.endTime; return `${s} - ${e}`; });
  statusLabel = computed(() => {
    const s = this.appt()?.status;
    const m: Record<string,string> = { pending:'در انتظار', confirmed:'تایید شده', cancelled:'لغو شده', completed:'انجام شده', no_show:'عدم حضور' };
    return m[s ?? ''] ?? s ?? '—';
  });
  badgeBg = computed(() => {
    const s = this.appt()?.status;
    if (s==='confirmed') return '#22c55e';
    if (s==='pending') return '#eab308';
    if (s==='cancelled') return '#ef4444';
    if (s==='completed') return '#3b82f6';
    return '#64748b';
  });
  address = computed(() => {
    const loc = (this.appt()?.barber as unknown as { barbershop?: { address?: string } })?.barbershop?.address;
    return loc ?? '—';
  });
  mapHref = computed(() => `https://maps.google.com/?q=${encodeURIComponent(this.address())}`);

  ngOnInit() { this.load(); }

  load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }
    this.loading.set(true);
    const obs = this.isAdmin() ? this.api.admin.adminAppointment(id) : this.api.appointments.get(id);
    obs.subscribe({
      next: (v) => { this.appt.set(v as Appointment); this.editNotes = (v as Appointment).notes ?? ''; this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=fallback'; }
  back() { this.router.navigateByUrl('/tabs/appointment'); }
  contact() {
    const tel = (this.appt()?.barber as unknown as { barbershop?: { phoneNumber?: string } })?.barbershop?.phoneNumber ?? '';
    if (tel) window.open(`tel:${tel}`, '_self');
    else this.toast.info('شماره تماس ثبت نشده');
  }

  doStatus(status: string) {
    const a = this.appt(); if (!a) return;
    this.busy.set(true);
    const obs = this.isAdmin() ? this.api.admin.updateAppointmentStatus(a.id, status) : this.api.appointments.status(a.id, status);
    obs.subscribe({
      next: (v) => { this.appt.set(v as Appointment); this.toast.success(fa.appointments.statusSuccess); this.busy.set(false); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busy.set(false); },
    });
  }

  doCancel() {
    const a = this.appt(); if (!a) return;
    if (a.status === 'cancelled') return;
    this.busy.set(true);
    const obs = this.isAdmin() ? this.api.admin.cancelAppointment(a.id) : this.api.appointments.cancel(a.id);
    obs.subscribe({
      next: (v) => { this.appt.set({ ...a, ...(v as Appointment), status: (v as Appointment).status ?? 'cancelled' } as Appointment); this.toast.success(fa.appointments.cancelSuccess); this.busy.set(false); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busy.set(false); },
    });
  }

  doDelete() {
    const a = this.appt(); if (!a || !this.isAdmin()) return;
    this.busy.set(true);
    this.api.admin.deleteAppointment(a.id).subscribe({
      next: () => { this.toast.success(fa.common.success); this.busy.set(false); this.router.navigateByUrl('/tabs/appointment'); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busy.set(false); },
    });
  }

  saveEdit() {
    const a = this.appt(); if (!a) return;
    this.saving.set(true);
    this.api.appointments.update(a.id, { notes: this.editNotes }).subscribe({
      next: (v) => { this.appt.set(v as Appointment); this.editing.set(false); this.toast.success(fa.common.success); this.saving.set(false); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.saving.set(false); },
    });
  }
}

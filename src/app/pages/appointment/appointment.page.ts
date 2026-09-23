import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonSpinner, IonBadge } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { ToastService } from '../../core/services/toast.service';
import { Appointment, Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonSpinner, IonBadge],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap turns-wrap" dir="rtl">
        <div class="turns-header">
          <div>
            <h1>{{ t.title }}</h1>
            <p>{{ headerSub() }}</p>
          </div>
          <span class="role-badge" [class.barber]="isBarber()" [class.admin]="isAdmin()">{{ roleLabel() }}</span>
        </div>

        <div class="filter-row" role="tablist">
          <button type="button" class="filter-pill" [class.active]="statusFilter()==='all'" (click)="setStatus('all')" role="tab">همه</button>
          <button type="button" class="filter-pill" [class.active]="statusFilter()==='pending'" (click)="setStatus('pending')" role="tab">در انتظار</button>
          <button type="button" class="filter-pill" [class.active]="statusFilter()==='confirmed'" (click)="setStatus('confirmed')" role="tab">تایید شده</button>
          <button type="button" class="filter-pill" [class.active]="statusFilter()==='cancelled'" (click)="setStatus('cancelled')" role="tab">لغو شده</button>
          <button type="button" class="filter-pill" [class.active]="statusFilter()==='completed'" (click)="setStatus('completed')" role="tab">انجام شده</button>
        </div>

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ c.loading }}</p></div>
        } @else if (errorMsg()) {
          <div class="dark-card" style="text-align:center;padding:20px"><p style="color:#ef4444;margin:0 0 10px">{{ errorMsg() }}</p><button type="button" class="filter-pill active" (click)="load()">تلاش مجدد</button></div>
        } @else if (!items().length) {
          <div class="dark-card" style="text-align:center;padding:22px">
            <p class="muted" style="margin:0 0 12px">{{ t.empty }}</p>
            @if (!isBarber()) {
              <a routerLink="/tabs/appointment/new" class="cta-inline">رزرو نوبت جدید</a>
            }
          </div>
        } @else {
          <div class="turn-grid">
            @for (a of items(); track a.id) {
              <div class="turn-card-wrap">
                <a class="turn-card" [routerLink]="['/tabs/appointment', a.id]">
                  <div class="turn-time">
                    <b dir="ltr">{{ timeOf(a) }}</b>
                    <small>{{ dateLabel(a.date) }}</small>
                    <ion-badge [style.--background]="badgeBg(a.status)" style="font-size:10px;margin-top:4px">{{ statusFa(a.status) }}</ion-badge>
                  </div>
                  <div class="turn-barber">
                    <div class="turn-text">
                      <b>{{ barberName(a) }}</b>
                      <small>{{ serviceName(a) }}</small>
                      @if (isBarber() || isAdmin()) { <small class="muted" style="font-size:10px">{{ a.user?.username ?? a.userId.slice(0,8) }}</small> }
                      @if (a.notes) { <small class="muted" style="font-size:10px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📝 {{ a.notes }}</small> }
                    </div>
                    <img [src]="avatar(a)" (error)="onImgError($event)" alt="" />
                  </div>
                </a>

                @if (isBarber() && a.status === 'pending') {
                  <div class="card-actions">
                    <button type="button" class="btn-sm accept" (click)="confirm(a)" [disabled]="busyId()===a.id">تایید</button>
                    <button type="button" class="btn-sm reject" (click)="reject(a)" [disabled]="busyId()===a.id">رد</button>
                  </div>
                }
                @if (isBarber() && a.status === 'confirmed') {
                  <div class="card-actions">
                    <button type="button" class="btn-sm done" (click)="complete(a)" [disabled]="busyId()===a.id">انجام شد</button>
                    <button type="button" class="btn-sm reject" (click)="reject(a)" [disabled]="busyId()===a.id">لغو</button>
                  </div>
                }

                @if (!isBarber()) {
                  <div class="card-actions">
                    @if (a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show') {
                      <button type="button" class="btn-sm ghost" (click)="startEdit(a)">ویرایش</button>
                      <button type="button" class="btn-sm reject" (click)="cancel(a)" [disabled]="busyId()===a.id">لغو</button>
                    }
                    @if (isAdmin()) {
                      <button type="button" class="btn-sm danger" (click)="remove(a)" [disabled]="busyId()===a.id">حذف</button>
                    }
                  </div>
                }

                @if (editingId()===a.id) {
                  <div class="edit-row">
                    <input class="edit-input" [(ngModel)]="editNotes" placeholder="یادداشت" maxlength="500" />
                    <button type="button" class="btn-sm accept" (click)="saveEdit(a)" [disabled]="busyId()===a.id">ذخیره</button>
                    <button type="button" class="btn-sm ghost" (click)="editingId.set(null)">انصراف</button>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (!isBarber() && !loading()) {
          <a routerLink="/tabs/appointment/new" class="cta-btn" style="text-decoration:none">+ رزرو نوبت جدید</a>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .turns-wrap { gap: 16px; padding-top: 14px; }
    .turns-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; text-align:right; }
    .turns-header h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .turns-header p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .role-badge { font-size:10px; font-weight:800; padding:4px 8px; border-radius:999px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-secondary); height:fit-content; white-space:nowrap; }
    .role-badge.barber { background:rgba(59,130,246,0.14); color:#3b82f6; border-color:rgba(59,130,246,0.25); }
    .role-badge.admin { background:rgba(168,85,247,0.14); color:#a855f7; border-color:rgba(168,85,247,0.25); }
    .filter-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .filter-pill { border:1px solid var(--card-border); background:var(--card-bg); color:var(--text-secondary); border-radius:8px; padding:7px 14px; font-size:11px; font-weight:700; font-family:inherit; cursor:pointer; }
    .filter-pill.active { background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .turn-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
    @media (max-width: 640px) { .turn-grid { grid-template-columns:1fr; } }
    .turn-card-wrap { display:flex; flex-direction:column; gap:8px; }
    .turn-card { display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:14px; min-height:72px; text-decoration:none; }
    .turn-barber { display:flex; align-items:center; gap:10px; flex:1; min-width:0; justify-content:flex-end; }
    .turn-barber img { width:44px; height:44px; border-radius:10px; object-fit:cover; background:#1e2a44; flex-shrink:0; }
    .turn-text { display:flex; flex-direction:column; gap:3px; text-align:right; min-width:0; align-items:flex-end; }
    .turn-text b { font-size:12px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .turn-text small { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .turn-time { display:flex; flex-direction:column; gap:2px; text-align:left; min-width:72px; flex-shrink:0; align-items:flex-start; }
    .turn-time b { font-size:13px; font-weight:800; color:var(--accent); direction:ltr; }
    .turn-time small { font-size:11px; color:var(--text-secondary); }
    .card-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .btn-sm { border-radius:8px; padding:6px 12px; font-size:11px; font-weight:700; font-family:inherit; cursor:pointer; border:1px solid var(--card-border); background:var(--card-bg); color:var(--text-primary); }
    .btn-sm:disabled { opacity:0.55; cursor:default; }
    .btn-sm.accept { background:#22c55e; border-color:#22c55e; color:#fff; }
    .btn-sm.reject { background:transparent; color:#ef4444; border-color:rgba(239,68,68,0.35); }
    .btn-sm.done { background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .btn-sm.ghost { background:transparent; }
    .btn-sm.danger { background:#ef4444; border-color:#ef4444; color:#fff; }
    .edit-row { display:flex; gap:8px; align-items:center; }
    .edit-input { flex:1; background:var(--card-bg); border:1px solid var(--card-border); border-radius:8px; padding:8px 10px; color:var(--text-primary); font-family:inherit; font-size:12px; outline:none; }
    .cta-inline, .cta-btn { display:inline-flex; align-items:center; justify-content:center; background:var(--accent); color:var(--accent-contrast); border-radius:10px; padding:10px 16px; font-size:13px; font-weight:800; text-decoration:none; }
    .cta-btn { width:100%; min-height:44px; margin-top:4px; }
  `],
})
export class AppointmentPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private viewRole = inject(ViewRoleService);
  private auth = inject(AuthService);
  t = fa.turns;
  c = fa.common;
  loading = signal(false);
  errorMsg = signal('');
  statusFilter = signal<StatusFilter>('all');
  items = signal<Appointment[]>([]);
  busyId = signal<string | null>(null);
  editingId = signal<string | null>(null);
  editNotes = '';

  isBarber = computed(() => this.viewRole.activeView() === 'barber' || this.auth.isBarber());
  isAdmin = computed(() => this.viewRole.activeView() === 'admin' || this.auth.isAdmin());

  headerSub = computed(() => {
    if (this.isBarber()) return 'نوبت‌های مراجعه‌کنندگان — تایید / رد';
    if (this.isAdmin()) return 'همه نوبت‌ها — مدیریت کامل';
    return this.t.subtitle;
  });
  roleLabel = computed(() => this.isAdmin() ? 'مدیر' : this.isBarber() ? 'آرایشگر' : 'مشتری');

  ngOnInit() { this.load(); }

  setStatus(s: StatusFilter) { this.statusFilter.set(s); this.load(); }

  load() {
    this.loading.set(true); this.errorMsg.set('');
    const params: Record<string, unknown> = {};
    const sf = this.statusFilter();
    if (sf !== 'all') params['status'] = sf;
    const src = this.isAdmin() ? this.api.admin.adminAppointments(params) : this.api.appointments.list(params);
    src.subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Appointment[] : ((v as { data: Appointment[] }).data ?? []);
        this.items.set(arr as Appointment[]);
        this.loading.set(false);
      },
      error: (e) => {
        this.errorMsg.set((e?.error as { message?: string })?.message ?? 'دریافت نوبت‌ها ناموفق بود');
        this.loading.set(false);
      },
    });
  }

  statusFa(s: string) {
    const m: Record<string,string> = { pending:'در انتظار', confirmed:'تایید شده', cancelled:'لغو شده', completed:'انجام شده', no_show:'عدم حضور' };
    return m[s] ?? s;
  }
  badgeBg(s: string) {
    if (s==='confirmed') return '#22c55e';
    if (s==='pending') return '#eab308';
    if (s==='cancelled') return '#ef4444';
    if (s==='completed') return '#3b82f6';
    return '#64748b';
  }
  timeOf(a: Appointment) {
    const v = a.startTime;
    if (v.includes('T')) return v.slice(11,16);
    return v;
  }
  barberName(a: Appointment) { return a.barber?.fullName ?? '—'; }
  serviceName(a: Appointment) { return a.service?.name ?? ''; }
  avatar(a: Appointment) { return (a.barber as Barber | undefined)?.profileImage ?? `https://i.pravatar.cc/100?u=${a.barberId}`; }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=fallback'; }
  dateLabel(iso: string) {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (iso.slice(0,10) === today) return 'امروز';
    if (iso.slice(0,10) === tomorrow) return 'فردا';
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(iso.slice(0,10) + 'T12:00:00')); } catch { return iso.slice(0,10); }
  }

  confirm(a: Appointment) { this.updateStatus(a, 'confirmed'); }
  reject(a: Appointment) {
    if (this.isBarber()) this.updateStatus(a, 'cancelled');
    else this.cancel(a);
  }
  complete(a: Appointment) { this.updateStatus(a, 'completed'); }

  private updateStatus(a: Appointment, status: string) {
    this.busyId.set(a.id);
    const obs = this.isAdmin() ? this.api.admin.updateAppointmentStatus(a.id, status) : this.api.appointments.status(a.id, status);
    obs.subscribe({
      next: () => { this.toast.success(fa.appointments.statusSuccess); this.busyId.set(null); this.load(); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busyId.set(null); },
    });
  }

  cancel(a: Appointment) {
    this.busyId.set(a.id);
    const obs = this.isAdmin() ? this.api.admin.cancelAppointment(a.id) : this.api.appointments.cancel(a.id);
    obs.subscribe({
      next: () => { this.toast.success(fa.appointments.cancelSuccess); this.busyId.set(null); this.load(); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busyId.set(null); },
    });
  }

  remove(a: Appointment) {
    if (!this.isAdmin()) return;
    this.busyId.set(a.id);
    this.api.admin.deleteAppointment(a.id).subscribe({
      next: () => { this.toast.success(fa.common.success); this.busyId.set(null); this.load(); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busyId.set(null); },
    });
  }

  startEdit(a: Appointment) { this.editingId.set(a.id); this.editNotes = a.notes ?? ''; }
  saveEdit(a: Appointment) {
    this.busyId.set(a.id);
    this.api.appointments.update(a.id, { notes: this.editNotes }).subscribe({
      next: () => { this.toast.success(fa.common.success); this.editingId.set(null); this.busyId.set(null); this.load(); },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.busyId.set(null); },
    });
  }
}

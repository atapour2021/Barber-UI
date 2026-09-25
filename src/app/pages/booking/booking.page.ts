import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonSpinner, IonBadge } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { Appointment, Barber, Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
type DayKey = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
interface DayRow { key: DayKey; label: string; enabled: boolean; start: string; end: string; breakStart: string; breakEnd: string; }
const DAY_DEFS: { key: DayKey; label: string }[] = [
  { key: 'saturday', label: 'شنبه' }, { key: 'sunday', label: 'یکشنبه' }, { key: 'monday', label: 'دوشنبه' },
  { key: 'tuesday', label: 'سه‌شنبه' }, { key: 'wednesday', label: 'چهارشنبه' }, { key: 'thursday', label: 'پنجشنبه' }, { key: 'friday', label: 'جمعه' },
];
const DEFAULT_START = '10:00'; const DEFAULT_END = '21:00'; const DEFAULT_BREAK_S = '14'; const DEFAULT_BREAK_E = '15';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonSpinner, IonBadge],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap booking-wrap" dir="rtl">
        <div class="book-head">
          <div>
            <h1>{{ isReserveMode() ? tb.reserveTitle : title() }}</h1>
            <p>{{ isReserveMode() ? tb.reserveSubtitle : headerSub() }}</p>
          </div>
          <span class="role-badge" [class.barber]="isBarber()" [class.admin]="isAdmin()">{{ roleLabel() }}</span>
        </div>

        @if (isReserveMode()) {
          @if (loadingReserve()) {
            <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
          } @else {
            @if (slotChecking()) { <div class="dark-card" style="text-align:center;padding:12px"><ion-spinner></ion-spinner><p class="muted" style="margin:6px 0 0;font-size:11px">{{ tb.checking }}</p></div> }
            @if (slotUnavailableReason()) { <div class="alert-error" style="text-align:center">{{ slotUnavailableReason() }}</div> }
            <div class="reserve-card barber-card">
              <img [src]="reserveAvatar()" (error)="onImgError($event)" alt="" />
              <div class="barber-text"><b>{{ reserveBarberName() }}</b><small>{{ reserveBranch() }}</small></div>
            </div>
            <div class="reserve-card details-card">
              <div class="detail-row"><span class="detail-val">{{ reserveServiceName() }}</span><span class="detail-label">{{ ta.service }}</span></div>
              <div class="detail-row"><span class="detail-val">{{ reserveDateLabel() }}</span><span class="detail-label">{{ ta.date }}</span></div>
              <div class="detail-row"><span class="detail-val" dir="ltr">{{ reserveTimeLabel() }}</span><span class="detail-label">{{ ta.startTime }}</span></div>
              <div class="detail-row"><span class="detail-val">{{ reserveDuration() }} {{ fa.servicesList.minute }}</span><span class="detail-label">{{ fa.services.duration }}</span></div>
              <div class="detail-row total-row"><span class="detail-val price">{{ formatPrice(reservePrice()) }} {{ fa.servicesList.currency }}</span><span class="detail-label">{{ fa.services.price }}</span></div>
            </div>
            <div class="note-section"><label class="note-label">{{ tb.noteLabel }}</label><textarea class="note-input" [(ngModel)]="note" [placeholder]="tb.optional" rows="2"></textarea></div>
            @if (reserveError()) { <div class="alert-error" style="text-align:center">{{ reserveError() }}</div> }
            @if (reserveOk()) { <div class="alert-ok" style="text-align:center">{{ reserveOk() }}</div> }
            <button class="confirm-btn" type="button" [disabled]="confirming() || !!slotUnavailableReason()" (click)="confirmReserve()">
              @if (confirming()) { <ion-spinner name="crescent" style="--color:#0b101e"></ion-spinner> } @else { {{ tb.confirmFinal }} }
            </button>
            <button type="button" class="link-btn" (click)="exitReserve()">{{ tb.backToList }}</button>
          }
        } @else {
          @if (isBarber()) {
            <button type="button" class="schedule-toggle" (click)="showSchedule.set(!showSchedule())">
              <span>{{ showSchedule() ? tb.closeSchedule : tb.manageSchedule }}</span>
              <span class="chev" [class.open]="showSchedule()">›</span>
            </button>
            @if (showSchedule()) {
              @if (loadingSchedule()) {
                <div class="dark-card" style="text-align:center;padding:22px"><ion-spinner></ion-spinner></div>
              } @else {
                <div class="days-list">
                  @for (d of days(); track d.key) {
                    <div class="day-card" [class.off]="!d.enabled">
                      <div class="day-text">
                        <b>{{ d.label }}</b>
                        @if (d.enabled) { <small>{{ faTime(d.start) }} {{ tb.until }} {{ faTime(d.end) }} &middot; {{ tb.breakLabel }} {{ faNum(d.breakStart) }} {{ tb.until }} {{ faNum(d.breakEnd) }}</small> }
                        @else { <small class="off">{{ tb.off }}</small> }
                      </div>
                      <button class="sw" type="button" role="switch" [attr.aria-checked]="d.enabled" [class.on]="d.enabled" (click)="toggle(d.key)"><span class="knob"></span></button>
                    </div>
                  }
                </div>
                @if (saveError()) { <div class="alert-error" style="text-align:center">{{ saveError() }}</div> }
                @if (saveOk()) { <div class="alert-ok" style="text-align:center">{{ saveOk() }}</div> }
                <button class="save-btn" type="button" [disabled]="saving()" (click)="saveSchedule()">
                  @if (saving()) { <ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner> } @else { {{ tb.saveSchedule }} }
                </button>
              }
            }
          }

          <div class="filter-row" role="tablist">
            <button type="button" class="filter-pill" [class.active]="statusFilter()==='all'" (click)="setStatus('all')">{{ ta.all }}</button>
            <button type="button" class="filter-pill" [class.active]="statusFilter()==='pending'" (click)="setStatus('pending')">{{ ta.pending }}</button>
            <button type="button" class="filter-pill" [class.active]="statusFilter()==='confirmed'" (click)="setStatus('confirmed')">{{ ta.confirmed }}</button>
            <button type="button" class="filter-pill" [class.active]="statusFilter()==='cancelled'" (click)="setStatus('cancelled')">{{ ta.cancelled }}</button>
            <button type="button" class="filter-pill" [class.active]="statusFilter()==='completed'" (click)="setStatus('completed')">{{ ta.completed }}</button>
          </div>

          @if (loading()) {
            <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ fa.common.loading }}</p></div>
          } @else if (errorMsg()) {
            <div class="dark-card" style="text-align:center;padding:20px"><p style="color:#ef4444;margin:0 0 10px">{{ errorMsg() }}</p><button type="button" class="filter-pill active" (click)="load()">{{ tc.retry }}</button></div>
          } @else if (!items().length) {
            <div class="dark-card" style="text-align:center;padding:22px">
              <p class="muted" style="margin:0 0 12px">{{ fa.turns.empty }}</p>
              @if (!isBarber()) { <a routerLink="/tabs/appointment/new" class="cta-inline">{{ ta.book }}</a> }
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
                      <button type="button" class="btn-sm accept" (click)="confirm(a)" [disabled]="busyId()===a.id">{{ ta.confirm }}</button>
                      <button type="button" class="btn-sm reject" (click)="reject(a)" [disabled]="busyId()===a.id">{{ tc.cancel }}</button>
                    </div>
                  }
                  @if (isBarber() && a.status === 'confirmed') {
                    <div class="card-actions">
                      <button type="button" class="btn-sm done" (click)="complete(a)" [disabled]="busyId()===a.id">{{ ta.done }}</button>
                      <button type="button" class="btn-sm reject" (click)="reject(a)" [disabled]="busyId()===a.id">{{ ta.cancel }}</button>
                    </div>
                  }
                  @if (!isBarber()) {
                    <div class="card-actions">
                      @if (a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show') {
                        <button type="button" class="btn-sm ghost" (click)="startEdit(a)">{{ tc.edit }}</button>
                        <button type="button" class="btn-sm reject" (click)="cancel(a)" [disabled]="busyId()===a.id">{{ ta.cancel }}</button>
                      }
                      <button type="button" class="btn-sm danger" (click)="remove(a)" [disabled]="busyId()===a.id">{{ tc.delete }}</button>
                    </div>
                  }
                  @if (isAdmin() && !isBarber()) {
                    <div class="card-actions">
                      @if (a.status==='pending') {
                        <button type="button" class="btn-sm accept" (click)="confirm(a)" [disabled]="busyId()===a.id">{{ ta.confirm }}</button>
                        <button type="button" class="btn-sm reject" (click)="reject(a)" [disabled]="busyId()===a.id">{{ tc.cancel }}</button>
                      }
                    </div>
                  }
                  @if (editingId()===a.id) {
                    <div class="edit-row">
                      <input class="edit-input" [(ngModel)]="editNotes" [placeholder]="ta.notesPlaceholder" maxlength="500" />
                      <button type="button" class="btn-sm accept" (click)="saveEdit(a)" [disabled]="busyId()===a.id">{{ tc.save }}</button>
                      <button type="button" class="btn-sm ghost" (click)="editingId.set(null)">{{ tc.cancel }}</button>
                    </div>
                  }
                </div>
              }
            </div>
          }
          @if (!isBarber() && !loading()) {
            <a routerLink="/tabs/appointment/new" class="cta-btn" style="text-decoration:none">+ {{ ta.book }}</a>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .booking-wrap { gap: 16px; padding-top: 14px; max-width: 760px; }
    .book-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; text-align:right; }
    .book-head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .book-head p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .role-badge { font-size:10px; font-weight:800; padding:4px 8px; border-radius:999px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-secondary); height:fit-content; white-space:nowrap; }
    .role-badge.barber { background:rgba(59,130,246,0.14); color:#3b82f6; border-color:rgba(59,130,246,0.25); }
    .role-badge.admin { background:rgba(168,85,247,0.14); color:#a855f7; border-color:rgba(168,85,247,0.25); }
    .schedule-toggle { width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:12px 14px; color:var(--text-primary); font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; }
    .chev { font-size:18px; line-height:1; transition: transform 0.15s; }
    .chev.open { transform: rotate(90deg); }
    .days-list { display:flex; flex-direction:column; gap:10px; width:100%; }
    .day-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 13px 14px; display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; box-sizing:border-box; }
    .day-card.off { opacity:0.95; }
    .day-text { display:flex; flex-direction:column; gap:4px; text-align:right; flex:1; min-width:0; }
    .day-text b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .day-text small { font-size:11px; color:var(--text-secondary); line-height:1.4; }
    .day-text small.off { color:var(--text-muted); }
    .sw { width:42px; height:24px; border-radius:999px; background:#1e293b; border:1px solid #334155; position:relative; cursor:pointer; flex-shrink:0; padding:0; }
    .sw.on { background:var(--accent); border-color:var(--accent); }
    .sw .knob { position:absolute; top:2px; right:2px; width:16px; height:16px; border-radius:999px; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.3); transition: transform 0.18s; }
    .sw.on .knob { transform: translateX(-16px); }
    .save-btn { width:100%; box-sizing:border-box; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:10px; padding:13px 16px; font-size:13px; font-weight:800; font-family:inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-height:44px; }
    .save-btn:disabled { opacity:0.7; cursor:default; }
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
    .confirm-btn { width:100%; box-sizing:border-box; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:10px; padding:14px 16px; font-size:14px; font-weight:800; font-family:inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-height:48px; }
    .confirm-btn:disabled { opacity:0.7; }
    .link-btn { background:none; border:none; color:var(--text-secondary); font:inherit; font-size:12px; cursor:pointer; text-align:center; width:100%; padding:8px; }
  `],
})
export class BookingPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private viewRole = inject(ViewRoleService);
  private auth = inject(AuthService);
  fa = fa;
  tb = fa.bookingExtra;
  ta = fa.appointments;
  tt = fa.turns;
  tc = fa.common;

  isBarber = computed(() => this.viewRole.activeView() === 'barber' || this.auth.isBarber());
  isAdmin = computed(() => this.viewRole.activeView() === 'admin' || this.auth.isAdmin());
  title = computed(() => this.isBarber() ? 'نوبت‌ها — پذیرش / رد' : this.isAdmin() ? 'مدیریت نوبت‌ها' : fa.turns.title);
  headerSub = computed(() => this.isBarber() ? 'نوبت‌های مراجعه‌کنندگان — تایید / رد' : this.isAdmin() ? 'همه نوبت‌ها — ایجاد / ویرایش / حذف' : fa.turns.subtitle);
  roleLabel = computed(() => this.isAdmin() ? 'مدیر' : this.isBarber() ? 'آرایشگر' : 'مشتری');

  statusFilter = signal<StatusFilter>('all');
  items = signal<Appointment[]>([]);
  loading = signal(false);
  errorMsg = signal('');
  busyId = signal<string | null>(null);
  editingId = signal<string | null>(null);
  editNotes = '';

  showSchedule = signal(false);
  loadingSchedule = signal(true);
  saving = signal(false);
  saveError = signal('');
  saveOk = signal('');
  days = signal<DayRow[]>(DAY_DEFS.map((d, i) => ({ key: d.key, label: d.label, enabled: i < 5, start: DEFAULT_START, end: DEFAULT_END, breakStart: DEFAULT_BREAK_S, breakEnd: DEFAULT_BREAK_E })));
  private barberIdSig = signal<string | null>(null);

  isReserveMode = signal(false);
  loadingReserve = signal(false);
  confirming = signal(false);
  reserveError = signal('');
  reserveOk = signal('');
  note = '';
  reserveBarber = signal<Barber | null>(null);
  reserveService = signal<Service | null>(null);
  reserveDateIso = signal(new Date().toISOString().slice(0, 10));
  reserveTimeStart = signal('14:30');
  reserveDateLabel = signal('شنبه، ۲۹ شهریور');
  slotChecking = signal(false);
  slotUnavailableReason = signal('');
  reserveTimeLabel = computed(() => this.reserveTimeStart());
  reserveBarberName = computed(() => this.reserveBarber()?.fullName ?? 'رضا کاظمی');
  reserveBranch = computed(() => this.reserveBarber()?.barbershop?.name ?? (this.reserveBarber() as unknown as { barbershopName?: string })?.barbershopName ?? fa.bookingExtra.branchFallback);
  reserveAvatar = computed(() => this.reserveBarber()?.profileImage ?? 'https://i.pravatar.cc/150?u=reza-kazemi');
  reserveServiceName = computed(() => this.reserveService()?.name ?? 'کوتاهی و استایل');
  reservePrice = computed(() => this.reserveService()?.price ?? 250000);
  reserveDuration = computed(() => this.reserveService()?.duration ?? 45);

  ngOnInit() {
    const qp = this.route.snapshot.queryParamMap;
    const hasReserve = !!(qp.get('barberId') || qp.get('serviceId') || qp.get('startTime') || qp.get('time'));
    if (hasReserve) {
      this.isReserveMode.set(true);
      this.initReserve();
    } else {
      this.isReserveMode.set(false);
      if (this.isBarber()) this.loadSchedule();
      this.load();
    }
    this.route.queryParamMap.subscribe(q => {
      const r = !!(q.get('barberId') || q.get('serviceId') || q.get('startTime') || q.get('time'));
      if (r !== this.isReserveMode()) {
        this.isReserveMode.set(r);
        if (r) this.initReserve(); else this.load();
      }
    });
  }

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
        this.errorMsg.set((e?.error as { message?: string })?.message ?? this.tc.failed);
        this.loading.set(false);
      },
    });
  }

  statusFa(s: string) {
    const m: Record<string,string> = { pending: this.ta.pending, confirmed: this.ta.confirmed, cancelled: this.ta.cancelled, completed: this.ta.completed, no_show:'عدم حضور' };
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
    if (iso.slice(0,10) === today) return this.tt.today;
    if (iso.slice(0,10) === tomorrow) return this.tt.tomorrow;
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(iso.slice(0,10) + 'T12:00:00')); } catch { return iso.slice(0,10); }
  }

  confirm(a: Appointment) { this.updateStatus(a, 'confirmed'); }
  reject(a: Appointment) {
    if (this.isBarber() || this.isAdmin()) this.updateStatus(a, 'cancelled');
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
    this.busyId.set(a.id);
    const obs = this.isAdmin() ? this.api.admin.deleteAppointment(a.id) : this.api.appointments.remove(a.id);
    obs.subscribe({
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

  private loadSchedule() {
    this.loadingSchedule.set(true);
    const applyBarber = (b: Barber) => {
      this.barberIdSig.set(b.id);
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
        return { ...d, enabled, start: hit?.start ?? d.start, end: hit?.end ?? d.end, breakStart: bs, breakEnd: be };
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
            if (found) applyBarber(found); else this.loadingSchedule.set(false);
          },
          error: () => this.loadingSchedule.set(false),
        });
      },
    });
  }
  toggle(key: DayKey) { this.days.update(arr => arr.map(d => d.key === key ? { ...d, enabled: !d.enabled } : d)); }
  saveSchedule() {
    if (this.saving()) return;
    this.saveError.set(''); this.saveOk.set(''); this.saving.set(true);
    const rows = this.days();
    const workingDays = rows.filter(r => r.enabled).map(r => r.key);
    const workingHours: Record<string, { start: string; end: string }> = {};
    for (const r of rows) if (r.enabled) workingHours[r.key] = { start: r.start, end: r.end };
    const breakTime: Record<string, { start: string; end: string }> = {};
    for (const r of rows) if (r.enabled) breakTime[r.key] = { start: `${r.breakStart}:00`.slice(0,5), end: `${r.breakEnd}:00`.slice(0,5) };
    const id = this.barberIdSig();
    const payload: Record<string, unknown> = { workingDays, workingHours, breakTime };
    const obs = id ? this.api.barbers.update(id, payload) : this.api.barbers.create(payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.saveOk.set(fa.toast.scheduleSaved); this.toast.success(fa.toast.scheduleSaved); },
      error: (err) => { this.saving.set(false); const msg = (err?.error as { message?: string })?.message ?? fa.toast.scheduleSaveFailed; this.saveError.set(msg); this.toast.error(msg); },
    });
  }
  faTime(t: string) { return this.faNum(t); }
  faNum(s: string) { try { return s.replace(/[0-9]/g, d => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][+d]); } catch { return s; } }

  private initReserve() {
    const qp = this.route.snapshot.queryParamMap;
    const sid = qp.get('serviceId'); const bid = qp.get('barberId'); const d = qp.get('date'); const st = qp.get('startTime') ?? qp.get('time');
    if (d) { this.reserveDateIso.set(d); this.reserveDateLabel.set(this.toFaDateLabel(d)); }
    if (st) this.reserveTimeStart.set(st.slice(0,5));
    this.loadingReserve.set(true); let pending = 0; const done = () => { pending--; if (pending <= 0) { this.loadingReserve.set(false); this.checkSlot(); } };
    if (sid) { pending++; this.api.services.get(sid).subscribe({ next: (v) => { this.reserveService.set(v as Service); done(); }, error: () => done() }); }
    else this.fetchFirstServiceReserve();
    if (bid) { pending++; this.api.barbers.get(bid).subscribe({ next: (v) => { this.reserveBarber.set(v as Barber); done(); }, error: () => done() }); }
    else this.fetchFirstBarberReserve();
    if (pending === 0) { this.loadingReserve.set(false); this.checkSlot(); }
  }
  private checkSlot() {
    const bid = this.reserveBarber()?.id ?? this.route.snapshot.queryParamMap.get('barberId') ?? '';
    const sid = this.reserveService()?.id ?? this.route.snapshot.queryParamMap.get('serviceId') ?? '';
    const date = this.reserveDateIso(); const t = this.reserveTimeStart();
    if (!bid || !date) return;
    this.slotChecking.set(true); this.slotUnavailableReason.set('');
    const p: Record<string,string> = { barberId: bid, date };
    if (sid) p['serviceId'] = sid;
    this.api.appointments.slots(p).subscribe({
      next: (v) => {
        const r = v as { slots?: { startTime: string; status: string }[]; reason?: string | null };
        if (r.reason) {
          const m: Record<string,string> = { holiday: fa.toast.barberOnHoliday, not_working_day: fa.toast.notWorkingDay, no_working_hours: fa.toast.noWorkingHours };
          this.slotUnavailableReason.set(m[r.reason] ?? r.reason);
        } else if (r.slots?.length) {
          const hit = r.slots.find(s => s.startTime.slice(11,16) === t);
          if (hit && String(hit.status).toLowerCase() === 'booked') this.slotUnavailableReason.set(fa.toast.slotBooked);
        }
        this.slotChecking.set(false);
      },
      error: () => this.slotChecking.set(false),
    });
  }
  private fetchFirstServiceReserve() { this.api.services.list().subscribe({ next: (v) => { const arr = Array.isArray(v) ? v : ((v as { data: Service[] }).data ?? []); if (arr.length && !this.reserveService()) this.reserveService.set(arr[0] as Service); } }); }
  private fetchFirstBarberReserve() { this.api.barbers.list().subscribe({ next: (v) => { const arr = Array.isArray(v) ? v : ((v as { data: Barber[] }).data ?? []); if (arr.length && !this.reserveBarber()) this.reserveBarber.set(arr[0] as Barber); } }); }
  formatPrice(n: number) { try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); } }
  toFaDateLabel(iso: string) { try { const d = new Date(iso + 'T12:00:00'); return new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); } catch { return iso; } }
  calcEnd(start: string, mins: number) { const [h, m] = start.split(':').map(Number); const total = h * 60 + m + mins; const hh = String(Math.floor(total / 60) % 24).padStart(2, '0'); const mm = String(total % 60).padStart(2, '0'); return `${hh}:${mm}`; }
  confirmReserve() {
    if (this.confirming()) return;
    this.reserveError.set(''); this.reserveOk.set('');
    const barberId = this.reserveBarber()?.id ?? this.route.snapshot.queryParamMap.get('barberId') ?? '';
    const serviceId = this.reserveService()?.id ?? this.route.snapshot.queryParamMap.get('serviceId') ?? '';
    if (!barberId || !serviceId) { this.reserveError.set(fa.toast.barberOrServiceRequired); this.toast.warning(fa.toast.barberOrServiceRequired); return; }
    if (this.slotUnavailableReason()) { this.reserveError.set(this.slotUnavailableReason()); this.toast.warning(this.slotUnavailableReason()); return; }
    const date = this.reserveDateIso(); const t = this.reserveTimeStart(); const end = this.calcEnd(t, this.reserveDuration());
    const startTime = `${date}T${t}:00.000Z`; const endTime = `${date}T${end}:00.000Z`;
    this.confirming.set(true);
    this.api.appointments.create({ barberId, serviceId, date, startTime, endTime, notes: this.note || undefined }).subscribe({
      next: () => { this.confirming.set(false); this.reserveOk.set(fa.toast.reserveSuccess); this.toast.success(fa.toast.reserveSuccess); setTimeout(() => { this.isReserveMode.set(false); this.router.navigateByUrl('/tabs/booking'); this.load(); }, 700); },
      error: (err) => {
        this.confirming.set(false);
        const raw = (err?.error as { message?: string | string[] })?.message;
        const msg = Array.isArray(raw) ? raw.join('، ') : (raw ?? fa.toast.reserveFailed);
        this.reserveError.set(msg); this.toast.error(msg);
      },
    });
  }
  exitReserve() { this.router.navigateByUrl('/tabs/booking'); this.isReserveMode.set(false); this.load(); }
}

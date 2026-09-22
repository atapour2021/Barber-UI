import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline, timeOutline, schoolOutline, calendarOutline, locationOutline, star, arrowBackOutline, chevronBackOutline, bookOutline, ribbonOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { Appointment, Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IonContent, IonSpinner, IonIcon],
  template: `
    <ion-content [fullscreen]="true">
      @if (isBarber()) {
        <div class="page-wrap barber-wrap" dir="rtl">
          <div class="barber-greeting">
            <h1>روز بخیر، {{ displayName() }}</h1>
            <p>امروز {{ todayCount() }} نوبت در برنامه دارید</p>
          </div>
          <div class="grid-3 barber-stats">
            <div class="dark-card barber-stat">
              <b>{{ todayCountFa() }}</b>
              <small>نوبت امروز</small>
            </div>
            <div class="dark-card barber-stat">
              <b>{{ completedCountFa() }}</b>
              <small>تکمیل شده</small>
            </div>
            <div class="dark-card barber-stat">
              <b>{{ revenueFa() }}</b>
              <small>درآمد امروز</small>
            </div>
          </div>
          <div class="section">
            <div class="section-head queue-head">
              <h3>صف امروز</h3>
              <a routerLink="/tabs/appointment" class="link-teal">همه</a>
            </div>
            @if (loadingAppt()) {
              <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
            } @else {
              <div class="queue-list">
                @for (q of queue(); track q.id) {
                  <a class="queue-card" [routerLink]="['/tabs/appointment', q.id]">
                    <span class="queue-time">{{ q.time }}</span>
                    <span class="queue-divider"></span>
                    <span class="queue-info">
                      <b>{{ q.name }}</b>
                      <small>{{ q.service }}</small>
                    </span>
                    <ion-icon name="chevron-back-outline" class="queue-chevron"></ion-icon>
                  </a>
                }
              </div>
            }
          </div>
          <div class="grid-3 action-grid">
            <a class="dark-card action-card" routerLink="/tabs/booking">
              <ion-icon name="time-outline"></ion-icon>
              <span>برنامه کاری</span>
            </a>
            <a class="dark-card action-card" routerLink="/tabs/training">
              <ion-icon name="book-outline"></ion-icon>
              <span>آموزش‌ها</span>
            </a>
            <a class="dark-card action-card" routerLink="/tabs/services">
              <ion-icon name="ribbon-outline"></ion-icon>
              <span>مدارک</span>
            </a>
          </div>
        </div>
      } @else {
        <div class="page-wrap home-wrap" dir="rtl">
          <div class="home-top-row">
            <span class="loc-pin"><ion-icon name="location-outline"></ion-icon></span>
            <div class="greeting">
              <h1>سلام، {{ displayName() }} <span class="wave">👋</span></h1>
              <p>{{ t.greetingReady }}</p>
            </div>
          </div>
          <a class="cta-orange" routerLink="/appointments">
            <ion-icon name="calendar-outline"></ion-icon>
            {{ t.newBooking }}
            <ion-icon name="arrow-back-outline" class="cta-arrow"></ion-icon>
          </a>
          <div class="grid-3 quick-row">
            <a class="quick-card" routerLink="/barbers">
              <ion-icon name="people-outline"></ion-icon>
              <span>{{ t.cards.barbers }}</span>
            </a>
            <a class="quick-card" routerLink="/appointments">
              <ion-icon name="time-outline"></ion-icon>
              <span>{{ t.cards.slots }}</span>
            </a>
            <a class="quick-card" [routerLink]="eduLink()">
              <ion-icon name="school-outline"></ion-icon>
              <span>{{ t.cards.education }}</span>
            </a>
          </div>
          <div class="section">
            <div class="section-head">
              <h3>{{ t.nextAppointment }}</h3>
              <a routerLink="/tabs/appointment" class="link-teal">{{ t.allAppointments }}</a>
            </div>
            @if (loadingAppt()) {
              <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
            } @else if (nextAppt(); as appt) {
              <a class="next-card" [routerLink]="['/tabs/appointment', appt.id]">
                <div class="next-main">
                  <div class="next-time">
                    <small>{{ t.today }}</small>
                    <b>{{ appt.startTime }}</b>
                  </div>
                  <div class="next-info">
                    <img [src]="nextApptAvatar()" (error)="onImgError($event)" alt="" />
                    <div class="next-text">
                      <b>{{ nextApptBarberName() }}</b>
                      <small>{{ nextApptService() }}</small>
                    </div>
                  </div>
                </div>
                <div class="next-progress"><span></span></div>
              </a>
            } @else {
              <div class="dark-card" style="text-align:center;padding:16px">
                <p class="muted" style="margin:0">{{ fa.appointments.empty }}</p>
                <a routerLink="/appointments" class="link-teal" style="font-size:12px;display:inline-block;margin-top:6px">{{ t.newBooking }}</a>
              </div>
            }
          </div>
          <div class="section">
            <div class="section-head">
              <h3>{{ t.topBarbers }}</h3>
              <a routerLink="/barbers" class="link-teal">{{ t.viewAll }}</a>
            </div>
            @if (loading()) {
              <div class="dark-card" style="text-align:center;padding:16px"><ion-spinner></ion-spinner></div>
            } @else {
              <div class="barber-grid">
                @for (b of topBarbers(); track b.id) {
                  <a class="barber-card" [routerLink]="['/barbers', b.id]">
                    <span class="avail-dot" [class.online]="b.isAvailable"></span>
                    <img [src]="avatar(b)" (error)="onImgError($event)" alt="" />
                    <b>{{ b.fullName }}</b>
                    <small><ion-icon name="star"></ion-icon> {{ t.rating }} · {{ barberCount(b) }} {{ t.appointmentsCount }}</small>
                  </a>
                }
                @if (!topBarbers().length) {
                  <div class="dark-card" style="grid-column:1/-1;text-align:center"><p class="muted" style="margin:0">{{ t.emptyBarbers }}</p></div>
                }
              </div>
            }
          </div>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .home-wrap { gap: 16px; padding-top: 10px; }
    .home-top-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .loc-pin { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:18px; flex-shrink:0; margin-top:2px; }
    .greeting { flex:1; text-align:right; }
    .greeting h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:6px; justify-content:flex-end; }
    .wave { font-size:20px; }
    .greeting p { margin:4px 0 0; font-size:11px; color:var(--text-secondary); }
    .cta-orange { display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:var(--accent-contrast); border-radius:10px; padding:11px 16px; font-size:13px; font-weight:800; text-decoration:none; align-self:flex-start; line-height:1; }
    .cta-orange ion-icon { font-size:16px; }
    .cta-arrow { font-size:15px; }
    .quick-row { margin-top:2px; }
    .quick-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:16px 8px; display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:var(--text-primary); }
    .quick-card ion-icon { font-size:22px; color:var(--accent); }
    .quick-card span { font-size:11px; font-weight:700; }
    .section-head h3 { font-size:13px; }
    .next-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; overflow:hidden; display:block; text-decoration:none; }
    .next-main { display:flex; align-items:center; justify-content:space-between; padding:14px 14px 12px; gap:12px; }
    .next-time { text-align:left; display:flex; flex-direction:column; gap:2px; min-width:60px; }
    .next-time small { font-size:11px; color:var(--text-secondary); }
    .next-time b { font-size:16px; font-weight:800; color:var(--accent); direction:ltr; }
    .next-info { display:flex; align-items:center; gap:10px; flex:1; justify-content:flex-end; min-width:0; }
    .next-info img { width:42px; height:42px; border-radius:10px; object-fit:cover; background:#1e2a44; flex-shrink:0; }
    .next-text { display:flex; flex-direction:column; gap:2px; text-align:right; min-width:0; }
    .next-text b { font-size:12px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .next-text small { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .next-progress { height:4px; background:#1e2a44; }
    .next-progress span { display:block; height:100%; width:100%; background:var(--accent); }
    .barber-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
    @media(max-width:600px){ .barber-grid{ gap:8px; } }
    .barber-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:12px 10px; display:flex; flex-direction:column; align-items:center; gap:6px; text-decoration:none; position:relative; text-align:center; min-width:0; }
    .barber-card img { width:44px; height:44px; border-radius:10px; object-fit:cover; background:#1e2a44; }
    .barber-card b { font-size:11px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .barber-card small { font-size:10px; color:var(--text-secondary); display:flex; align-items:center; gap:4px; white-space:nowrap; }
    .barber-card small ion-icon { color:var(--accent); font-size:11px; }
    .avail-dot { position:absolute; top:10px; left:10px; width:7px; height:7px; border-radius:999px; background:#64748b; border:2px solid var(--card-bg); }
    .avail-dot.online { background:var(--ok-green); }
    .barber-wrap { gap: 14px; padding-top: 14px; }
    .barber-greeting { text-align:right; }
    .barber-greeting h1 { margin:0; font-size:20px; font-weight:800; color:var(--text-primary); }
    .barber-greeting p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .barber-stats { margin-top: 2px; }
    .barber-stat { text-align:center; padding:16px 8px; display:flex; flex-direction:column; align-items:center; gap:4px; }
    .barber-stat b { font-size:17px; font-weight:800; color:var(--accent); line-height:1; display:block; }
    .barber-stat small { font-size:10px; color:var(--text-secondary); font-weight:500; }
    .queue-head { margin:10px 0 10px; }
    .queue-head h3 { font-size:13px; }
    .queue-head a { font-size:11px; }
    .queue-list { display:flex; flex-direction:column; gap:10px; }
    .queue-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:14px 12px; display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--text-primary); }
    .queue-time { color:var(--accent); font-size:13px; font-weight:800; direction:ltr; min-width:44px; text-align:center; }
    .queue-divider { width:1px; height:28px; background:var(--card-border); flex-shrink:0; }
    .queue-info { flex:1; display:flex; flex-direction:column; gap:2px; text-align:right; min-width:0; }
    .queue-info b { font-size:12px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .queue-info small { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .queue-chevron { font-size:14px; color:var(--text-secondary); flex-shrink:0; }
    .action-grid { margin-top: 6px; }
    .action-card { padding:18px 8px; display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:var(--text-primary); text-align:center; }
    .action-card ion-icon { font-size:20px; color:var(--text-primary); }
    .action-card span { font-size:11px; font-weight:700; }
  `],
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private viewRole = inject(ViewRoleService);
  fa = fa;
  t = fa.home;
  c = fa.common;
  isBarber = computed(() => this.viewRole.activeView() === 'barber');
  loading = signal(false);
  loadingAppt = signal(false);
  barbers = signal<Barber[]>([]);
  appointments = signal<Appointment[]>([]);
  nextAppt = computed(() => {
    const arr = this.appointments();
    if (!arr.length) return null;
    return [...arr].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0] ?? null;
  });
  topBarbers = computed(() => this.barbers().slice(0, 3));
  displayName = computed(() => {
    const u = this.auth.user();
    if (u?.name) return u.name;
    if (u?.username) return u.username;
    return this.isBarber() ? 'رضا' : 'امیر';
  });
  private todayStr = new Date().toISOString().slice(0, 10);
  todayCount = computed(() => {
    const arr = this.appointments();
    if (!arr.length) return 6;
    const t = this.todayStr;
    const c = arr.filter(a => (a.date ?? '').slice(0, 10) === t).length;
    return c || arr.length;
  });
  completedCount = computed(() => {
    const arr = this.appointments();
    if (!arr.length) return 4;
    return arr.filter(a => a.status === 'completed').length || 4;
  });
  todayCountFa = computed(() => this.toFa(this.todayCount()));
  completedCountFa = computed(() => this.toFa(this.completedCount()));
  revenueFa = computed(() => {
    const arr = this.appointments();
    if (!arr.length) return '۱/۲ م';
    let sum = 0;
    for (const a of arr) sum += (a.service?.price as number) ?? 0;
    if (!sum) return '۱/۲ م';
    if (sum >= 1000000) return this.toFa((sum / 1000000).toFixed(1)) + ' م';
    if (sum >= 1000) return this.toFa(Math.round(sum / 1000).toString()) + ' هـ';
    return this.toFa(sum.toString());
  });
  queue = computed(() => {
    const arr = this.appointments();
    if (!arr.length) {
      return [
        { id: 'mock-1', name: 'امیر محمدی', service: 'کوتاهی و استایل', time: '۱۴:۳۰' },
        { id: 'mock-2', name: 'پویا احمدی', service: 'اصلاح و فرم ریش', time: '۱۶:۰۰' },
        { id: 'mock-3', name: 'سام نادری', service: 'پکیج کامل داماد', time: '۱۷:۴۵' },
      ];
    }
    return [...arr].sort((a,b)=> `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).slice(0,3).map(a => ({
      id: a.id,
      name: a.user?.name ? `${a.user.name} ${a.user.family ?? ''}`.trim() : (a.barber?.fullName ?? a.barberId ?? 'مشتری'),
      service: a.service?.name ?? 'خدمت',
      time: this.toFa(a.startTime ?? '--:--'),
    }));
  });
  nextApptBarberName = computed(() => {
    const a = this.nextAppt();
    return a?.barber?.fullName ?? a?.barberId ?? 'رضا کاظمی';
  });
  nextApptService = computed(() => {
    const a = this.nextAppt();
    return a?.service?.name ?? 'کوتاهی و استایل + اصلاح ریش';
  });
  nextApptAvatar = computed(() => {
    const a = this.nextAppt();
    const img = (a?.barber as Barber | undefined)?.profileImage;
    if (img) return img;
    return 'https://i.pravatar.cc/100?u=' + (a?.barberId ?? 'reza');
  });
  constructor() {
    addIcons({ peopleOutline, timeOutline, schoolOutline, calendarOutline, locationOutline, star, arrowBackOutline, chevronBackOutline, bookOutline, ribbonOutline });
  }
  private toFa(s: string | number) {
    const en = String(s);
    const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return en.replace(/[0-9]/g, d => faDigits[+d]).replace('.', '/');
  }
  eduLink() { return '/training'; }
  avatar(b: Barber) { return b.profileImage ?? `https://i.pravatar.cc/100?u=${b.id}`; }
  barberCount(b: Barber) { return (b as unknown as { _count?: number })._count ?? 248; }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=fallback'; }
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.loadingAppt.set(true);
    this.api.barbers.list().subscribe({
      next: (v) => { this.barbers.set(v as Barber[]); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.api.appointments.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v : ((v as { data: Appointment[] }).data ?? []);
        this.appointments.set(arr as Appointment[]);
        this.loadingAppt.set(false);
      },
      error: () => this.loadingAppt.set(false),
    });
  }
}

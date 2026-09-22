import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  timeOutline,
  schoolOutline,
  calendarOutline,
  locationOutline,
  star,
  arrowBackOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IonContent, IonSpinner, IonIcon],
  template: `
    <ion-content [fullscreen]="true">
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
            <a routerLink="/tabs/appointments" class="link-teal">{{ t.allAppointments }}</a>
          </div>

          @if (loadingAppt()) {
            <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner></div>
          } @else if (nextAppt(); as appt) {
            <div class="next-card">
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
            </div>
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
    .next-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; overflow:hidden; }
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
  `],
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  fa = fa;
  t = fa.home;
  c = fa.common;
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
    return 'امیر';
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
    addIcons({ peopleOutline, timeOutline, schoolOutline, calendarOutline, locationOutline, star, arrowBackOutline });
  }
  eduLink() {
    return '/training';
  }
  avatar(b: Barber) {
    return b.profileImage ?? `https://i.pravatar.cc/100?u=${b.id}`;
  }
  barberCount(b: Barber) {
    return (b as unknown as { _count?: number })._count ?? 248;
  }
  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=fallback';
  }
  ngOnInit() {
    this.load();
  }
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

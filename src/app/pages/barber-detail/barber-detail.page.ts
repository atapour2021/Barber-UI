import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';

type BarberVM = Barber & { _rating?: string; _count?: number; _verifiedLabel?: string };

const FALLBACK_MAP: Record<string, BarberVM> = {
  a1: { id: 'a1', fullName: 'رضا کاظمی', bio: 'کوتاهی کلاسیک و ریش', profileImage: 'https://i.pravatar.cc/300?img=15', specialties: ['کوتاهی کلاسیک و ریش'], status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '', _rating: '۴٫۹', _count: 248 },
  r1: { id: 'r1', fullName: 'رضا کاظمی', bio: 'کوتاهی کلاسیک و ریش', profileImage: 'https://i.pravatar.cc/300?img=15', specialties: ['کوتاهی کلاسیک و ریش'], status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '', _rating: '۴٫۹', _count: 248 },
  m1: { id: 'm1', fullName: 'مهدی تهرانی', bio: 'فید و استایل مدرن', profileImage: 'https://i.pravatar.cc/300?img=12', specialties: ['فید و استایل مدرن'], status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '', _rating: '۴٫۸', _count: 193 },
};

const FALLBACK_DEFAULT: BarberVM = FALLBACK_MAP['a1'];

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [RouterLink, IonContent, IonSpinner, IonIcon],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap profile-wrap" dir="rtl">
        <h1 class="profile-title">{{ t.title }}</h1>

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:22px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ t.loading }}</p></div>
        } @else if (!barber()) {
          <div class="dark-card" style="text-align:center;padding:20px"><p class="muted" style="margin:0">{{ t.notFound }}</p><a routerLink="/barbers" class="link-teal" style="margin-top:8px;display:inline-block">{{ t.backToBarbers }}</a></div>
        } @else {
          <div class="profile-hero">
            <div class="avatar-frame">
              <img [src]="avatar()" (error)="onImgError($event)" [alt]="barber()!.fullName" loading="eager" />
            </div>
            <b class="hero-name">{{ barber()!.fullName }}</b>
            <small class="hero-spec">{{ spec() }}</small>
            <div class="hero-meta">
              <span class="meta-rating"><ion-icon name="star" aria-hidden="true"></ion-icon> {{ rating() }}</span>
              <span class="meta-count">{{ countFa() }} {{ t.customerSuffix }}</span>
              <span class="meta-verified">{{ t.verified }}</span>
            </div>
          </div>

          <div class="info-card">
            <h3>{{ t.about }}</h3>
            <p>{{ about() }}</p>
          </div>

          <div class="info-card">
            <h3>{{ t.todayHours }}</h3>
            <div class="hours-row">
              <span class="hours-date">{{ todayLabel() }}</span>
              <span class="hours-time">{{ hoursLabel() }}</span>
            </div>
          </div>

          <a class="cta-btn" [routerLink]="['/tabs/booking']" [queryParams]="{ barberId: barber()!.id }">{{ t.cta }}</a>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-wrap { gap: 14px; padding-top: 12px; max-width: 560px; }
    .profile-title { margin: 0 0 8px; font-size: 22px; font-weight: 800; color: var(--text-primary); text-align: right; line-height: 1.3; }
    .profile-hero { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 6px 0 4px; text-align: center; }
    .avatar-frame { width: 112px; height: 112px; border-radius: 14px; padding: 3px; background: rgba(245,158,11,0.35); border: 1px solid rgba(245,158,11,0.55); box-sizing: border-box; }
    .avatar-frame img { width: 100%; height: 100%; border-radius: 11px; object-fit: cover; display: block; background: #1e2a44; }
    .hero-name { font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1.2; margin-top: 4px; }
    .hero-spec { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
    .hero-meta { display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; font-size: 11px; margin-top: 2px; }
    .meta-rating { display: inline-flex; align-items: center; gap: 4px; color: var(--text-secondary); }
    .meta-rating ion-icon { color: var(--accent); font-size: 14px; }
    .meta-count { color: var(--text-secondary); }
    .meta-verified { color: #22c55e; font-weight: 700; }
    .info-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; width: 100%; box-sizing: border-box; text-align: right; }
    .info-card h3 { margin: 0 0 10px; font-size: 13px; font-weight: 800; color: var(--text-primary); }
    .info-card p { margin: 0; font-size: 11px; line-height: 1.9; color: var(--text-secondary); }
    .hours-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .hours-date { font-size: 11px; color: var(--text-secondary); }
    .hours-time { font-size: 11px; font-weight: 700; color: #22c55e; direction: ltr; }
    .cta-btn { display: flex; align-items: center; justify-content: center; width: 100%; box-sizing: border-box; background: var(--accent); color: var(--accent-contrast); border: none; border-radius: 10px; padding: 13px 16px; font-size: 13px; font-weight: 800; font-family: inherit; text-decoration: none; cursor: pointer; transition: opacity 0.15s, transform 0.1s; min-height: 46px; }
    .cta-btn:active { transform: scale(0.99); }
    .cta-btn:hover { opacity: 0.95; }
    @media (min-width: 640px) { .profile-title { font-size: 24px; } .avatar-frame { width: 120px; height: 120px; } }
  `],
})
export class BarberDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  t = fa.barberDetailExtra;
  c = fa.common;
  loading = signal(true);
  barber = signal<BarberVM | null>(null);
  todayLabel = signal(this.computeTodayLabel());
  hoursLabel = signal('۱۰:۰۰ تا ۲۱:۰۰');

  avatar = computed(() => this.barber()?.profileImage ?? `https://i.pravatar.cc/300?u=${this.barber()?.id ?? 'fallback'}`);
  spec = computed(() => {
    const b = this.barber();
    if (!b) return '—';
    if (b.specialties?.length) return b.specialties[0] as string;
    return b.bio ?? '—';
  });
  rating = computed(() => this.barber()?._rating ?? '۴٫۹');
  countFa = computed(() => this.toFa(this.barber()?._count ?? 248));
  about = computed(() => {
    const b = this.barber();
    if (b?.bio && b.bio.length > 20) return b.bio;
    if (b?.bio) return `بیش از ۹ سال تجربه در ${b.bio}، طراحی استایل و اصلاح حرفه‌ای ریش. کیفیت و رضایت شما اولویت من است.`;
    return this.t.fallbackAbout;
  });

  constructor() { addIcons({ star }); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? 'a1';
    this.loading.set(true);
    this.api.barbers.get(id).subscribe({
      next: (b) => {
        const vm = this.enrich(b as BarberVM, id);
        this.barber.set(vm);
        this.hoursLabel.set(this.computeHours(vm));
        this.loading.set(false);
      },
      error: () => {
        const fb = FALLBACK_MAP[id] ?? FALLBACK_DEFAULT;
        this.barber.set({ ...fb, id });
        this.hoursLabel.set(this.computeHours(fb));
        this.loading.set(false);
      },
    });
  }

  enrich(b: BarberVM, id: string): BarberVM {
    const fb = FALLBACK_MAP[id] ?? FALLBACK_DEFAULT;
    return {
      ...fb,
      ...b,
      id: b.id ?? id,
      fullName: b.fullName ?? fb.fullName,
      bio: b.bio ?? fb.bio,
      profileImage: b.profileImage ?? fb.profileImage,
      specialties: b.specialties ?? fb.specialties,
      _rating: (b as BarberVM)._rating ?? fb._rating,
      _count: (b as BarberVM)._count ?? fb._count,
    };
  }

  computeHours(b: BarberVM): string {
    const wh = b.workingHours as Record<string, { start: string; end: string }> | null | undefined;
    if (wh) {
      const now = new Date();
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const k = dayKeys[now.getDay()];
      const faKeys: Record<string, string> = { saturday: 'شنبه', sunday: 'یکشنبه', monday: 'دوشنبه', tuesday: 'سه‌شنبه', wednesday: 'چهارشنبه', thursday: 'پنج‌شنبه', friday: 'جمعه' };
      const hit = wh[k] ?? wh[faKeys[k]] ?? wh[Object.keys(wh)[0]];
      if (hit?.start && hit?.end) return `${this.toFaTime(hit.start)} تا ${this.toFaTime(hit.end)}`;
    }
    return '۱۰:۰۰ تا ۲۱:۰۰';
  }

  toFaTime(t: string): string {
    try {
      const [h, m] = t.split(':');
      const hh = new Intl.NumberFormat('fa-IR').format(Number(h));
      const mm = new Intl.NumberFormat('fa-IR').format(Number(m));
      const pad = (s: string) => s.length === 1 ? '۰' + s : s;
      return `${pad(hh)}:${pad(mm)}`;
    } catch { return t; }
  }

  computeTodayLabel(): string {
    try {
      const d = new Date();
      const fmt = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' });
      return fmt.format(d);
    } catch { return 'شنبه، ۲۹ شهریور'; }
  }

  toFa(n: number): string {
    try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); }
  }

  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/300?u=fallback'; }
}

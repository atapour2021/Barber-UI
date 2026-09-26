import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, star } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { unwrapPaginated } from '../../core/api/utils';

type BarberVM = Barber & { _count?: number; _rating?: string };

const FALLBACK: BarberVM[] = [
  { id: 'r1', fullName: 'رضا کاظمی', bio: 'کوتاهی کلاسیک و ریش', profileImage: 'https://i.pravatar.cc/200?img=15', specialties: ['کوتاهی کلاسیک و ریش'], status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '', _rating: '۴.۹', _count: 248 },
  { id: 'm1', fullName: 'مهدی تهرانی', bio: 'فید و استایل مدرن', profileImage: 'https://i.pravatar.cc/200?img=12', specialties: ['فید و استایل مدرن'], status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '', _rating: '۴.۸', _count: 193 },
  { id: 'a1', fullName: 'علی رضایی', bio: 'گریم و داماد', profileImage: 'https://i.pravatar.cc/200?img=68', specialties: ['گریم و داماد'], status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '', _rating: '۴.۷', _count: 156 },
];

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonSpinner, IonIcon, InfiniteScrollDirective],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap barbers-wrap" dir="rtl">
        <div class="barbers-head">
          <h1>{{ t.title }}</h1>
          <p>{{ countLabel() }}</p>
        </div>

        <label class="search-bar" dir="rtl">
          <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
          <input
            type="search"
            [placeholder]="ph"
            [(ngModel)]="query"
            (ngModelChange)="q.set($event)"
            autocomplete="off"
          />
        </label>

        @if (loading() && !items().length) {
          <div class="dark-card" style="text-align:center;padding:22px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ c.loading }}</p></div>
        } @else if (!filtered().length && !loadingMore()) {
          <div class="dark-card" style="text-align:center;padding:20px"><p class="muted" style="margin:0">{{ t.empty }}</p></div>
        } @else {
          <div class="barbers-grid">
            @for (b of filtered(); track b.id) {
              <div class="barber-select-card">
                <div class="bsc-top">
                  <img [src]="avatar(b)" (error)="onImgError($event)" [alt]="b.fullName" loading="lazy" />
                  <div class="bsc-meta">
                    <b class="bsc-name">{{ b.fullName }}</b>
                    <small class="bsc-spec">{{ spec(b) }}</small>
                    <span class="bsc-rating">
                      <ion-icon name="star" aria-hidden="true"></ion-icon>
                      <em>{{ rating(b) }}</em>
                      <span>({{ count(b) }} {{ t.appointmentSuffix }})</span>
                    </span>
                  </div>
                </div>
                <a class="bsc-btn" [routerLink]="['/barbers', b.id]">{{ t.viewProfile }}</a>
              </div>
            }
          </div>
          @if (loadingMore()) { <div style="text-align:center;padding:14px"><ion-spinner></ion-spinner></div> }
          @if (hasMore()) { <div appInfiniteScroll (scrolled)="onScroll()" [disabled]="loading() || loadingMore()" style="height:1px"></div> }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .barbers-wrap { gap: 14px; padding-top: 10px; }
    .barbers-head { text-align:right; }
    .barbers-head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .barbers-head p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .search-bar {
      display:flex; align-items:center; gap:10px;
      background: var(--card-bg);
      border:1px solid var(--card-border);
      border-radius:10px;
      padding:10px 12px;
      width:100%; box-sizing:border-box;
    }
    .search-bar ion-icon { font-size:18px; color:var(--text-muted); flex-shrink:0; }
    .search-bar input {
      flex:1; min-width:0; border:none; outline:none; background:transparent;
      color: var(--text-primary); font-size:13px; font-family: inherit; text-align:right; direction: rtl;
    }
    .search-bar input::placeholder { color: var(--text-muted); }
    .barbers-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
    @media (max-width: 700px) { .barbers-grid { grid-template-columns:1fr; } }
    .barber-select-card {
      background: var(--card-bg);
      border:1px solid var(--card-border);
      border-radius:14px;
      padding:14px;
      display:flex; flex-direction:column; gap:12px;
    }
    .bsc-top { display:flex; gap:12px; align-items:flex-start; }
    .bsc-top img {
      width:64px; height:64px; border-radius:10px; object-fit:cover;
      background:#1e2a44; flex-shrink:0;
    }
    .bsc-meta { flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; text-align:right; align-items:flex-end; }
    .bsc-name { font-size:13px; font-weight:800; color:var(--text-primary); line-height:1.2; }
    .bsc-spec { font-size:11px; color:var(--text-secondary); line-height:1.4; }
    .bsc-rating { display:inline-flex; align-items:center; gap:5px; font-size:11px; color:var(--text-secondary); margin-top:4px; flex-wrap:wrap; }
    .bsc-rating ion-icon { color:var(--accent); font-size:13px; }
    .bsc-rating em { font-style:normal; color:var(--text-primary); font-weight:700; font-size:11px; }
    .bsc-rating span { color:var(--text-secondary); font-size:11px; }
    .bsc-btn {
      display:flex; align-items:center; justify-content:center;
      width:100%; box-sizing:border-box;
      border:1px solid var(--card-border-2, var(--card-border));
      background: rgba(255,255,255,0.02);
      color: var(--text-primary);
      border-radius:8px;
      padding:9px 10px;
      font-size:12px; font-weight:700;
      text-decoration:none; text-align:center;
    }
    .bsc-btn:hover { background: var(--card-bg-2); border-color: var(--card-border-2); }
    .bsc-btn:active { transform: scale(0.99); }
  `],
})
export class BarbersPage implements OnInit {
  private api = inject(ApiService);
  t = fa.barbersList;
  c = fa.common;
  ph = fa.barbersList.searchPlaceholder;
  loading = signal(false);
  loadingMore = signal(false);
  hasMore = signal(true);
  private page = 1;
  private limit = 20;
  items = signal<BarberVM[]>([]);
  q = signal('');
  query = '';
  filtered = computed(() => {
    const s = this.q().trim().toLowerCase();
    const arr = this.items();
    if (!s) return arr;
    return arr.filter(b => {
      const hay = `${b.fullName} ${b.bio ?? ''} ${(b.specialties ?? []).join(' ')}`.toLowerCase();
      return hay.includes(s);
    });
  });
  countLabel = computed(() => {
    const n = this.items().length;
    const f = this.toFa(n);
    return `${f} ${this.t.countSuffix}`;
  });

  constructor() { addIcons({ searchOutline, star }); }

  ngOnInit() { this.load(true); }

  onScroll() { if (!this.hasMore() || this.loading() || this.loadingMore()) return; this.load(false); }

  load(reset = true) {
    if (reset) { this.page = 1; this.hasMore.set(true); this.loading.set(true); }
    else this.loadingMore.set(true);
    this.api.barbers.list({ page: this.page, limit: this.limit }).subscribe({
      next: (v) => {
        const p = unwrapPaginated<BarberVM>(v);
        const useFallback = reset && !p.data.length && this.page === 1;
        const arr = useFallback ? FALLBACK : (p.data as BarberVM[]);
        if (reset) this.items.set(arr);
        else this.items.update((a) => [...a, ...arr]);
        const more = p.data.length === this.limit && (p.total ? this.items().length < p.total : true);
        if (p.data.length) this.page++;
        this.hasMore.set(more && !useFallback);
        this.loading.set(false); this.loadingMore.set(false);
      },
      error: () => {
        if (reset) this.items.set(FALLBACK);
        this.hasMore.set(false);
        this.loading.set(false); this.loadingMore.set(false);
      },
    });
  }

  avatar(b: BarberVM) { return b.profileImage ?? `https://i.pravatar.cc/200?u=${b.id}`; }
  spec(b: BarberVM) {
    if (b.specialties?.length) return b.specialties[0] as string;
    return b.bio ?? '—';
  }
  rating(b: BarberVM) { return b._rating ?? '۴.۸'; }
  count(b: BarberVM) { return this.toFa(b._count ?? 248); }
  toFa(n: number) { try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); } }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/200?u=fallback'; }
}

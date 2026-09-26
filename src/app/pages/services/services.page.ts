import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBackOutline, cutOutline, personOutline, ribbonOutline, sparklesOutline, timeOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { unwrapPaginated } from '../../core/api/utils';

const DEMO: Service[] = [
  { id: '1', name: 'کوتاهی و استایل', description: null, price: 350000, duration: 45, icon: 'cut', barberId: '' },
  { id: '2', name: 'اصلاح و فرم ریش', description: null, price: 280000, duration: 20, icon: 'sparkles', barberId: '' },
  { id: '3', name: 'پکیج کامل داماد', description: null, price: 1850000, duration: 120, icon: 'ribbon', barberId: '' },
  { id: '4', name: 'پاکسازی پوست', description: null, price: 480000, duration: 40, icon: 'person', barberId: '' },
];

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, IonContent, IonIcon, IonSpinner, InfiniteScrollDirective],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap svc-wrap" dir="rtl">
        <div class="svc-header">
          <h1>{{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
        </div>

        @if (loading() && !items().length) {
          <div class="dark-card" style="text-align:center;padding:24px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ t.loading }}</p></div>
        } @else if (error()) {
          <div class="alert-error" style="text-align:center">{{ error() }}</div>
        } @else {
          @if (!displayItems().length && !loadingMore()) {
            <div class="dark-card" style="text-align:center;padding:20px"><p class="muted" style="margin:0">{{ t.empty }}</p></div>
          } @else {
            <div class="svc-grid">
              @for (s of displayItems(); track s.id) {
                <a class="svc-card" [routerLink]="['/tabs/booking']" [queryParams]="{ serviceId: s.id }">
                  <span class="svc-go" aria-hidden="true"><ion-icon name="chevron-back-outline"></ion-icon></span>
                  <span class="svc-price"><b>{{ formatPrice(s.price) }}</b><small>{{ t.currency }}</small></span>
                  <span class="svc-body">
                    <span class="svc-text">
                      <b>{{ s.name }}</b>
                      <small><ion-icon name="time-outline"></ion-icon> {{ s.duration }} {{ t.minute }}</small>
                    </span>
                    <span class="svc-icon"><ion-icon [name]="iconFor(s)"></ion-icon></span>
                  </span>
                </a>
              }
            </div>
            @if (loadingMore()) { <div style="text-align:center;padding:14px"><ion-spinner></ion-spinner></div> }
            @if (hasMore() && items().length) { <div appInfiniteScroll (scrolled)="onScroll()" [disabled]="loading() || loadingMore()" style="height:1px"></div> }
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .svc-wrap { gap: 16px; padding-top: 12px; }
    .svc-header { text-align:right; }
    .svc-header h1 { margin:0; font-size:24px; font-weight:800; color:var(--text-primary); letter-spacing:0; }
    .svc-header p { margin:6px 0 0; font-size:12px; color:var(--text-secondary); }
    .svc-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
    @media (max-width: 640px) { .svc-grid { grid-template-columns:1fr; } }
    .svc-card {
      display:flex; align-items:center; justify-content:space-between; gap:10px;
      background: var(--card-bg);
      border:1px solid var(--card-border);
      border-radius:12px;
      padding:14px 12px;
      text-decoration:none;
      transition: border-color 0.15s, background 0.15s;
    }
    .svc-card:hover { border-color:var(--card-border-2); background: var(--card-bg-2); }
    .svc-card:active { transform: scale(0.99); }
    .svc-body { display:flex; align-items:center; gap:10px; flex:1; min-width:0; justify-content:flex-end; }
    .svc-icon {
      width:44px; height:44px; border-radius:10px;
      display:inline-flex; align-items:center; justify-content:center;
      background: rgba(245,158,11,0.14);
      border:1px solid rgba(245,158,11,0.18);
      color: var(--accent);
      font-size:19px;
      flex-shrink:0;
    }
    .svc-text { display:flex; flex-direction:column; gap:4px; text-align:right; min-width:0; align-items:flex-end; }
    .svc-text b { font-size:13px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .svc-text small { font-size:11px; color:var(--text-secondary); display:inline-flex; align-items:center; gap:4px; }
    .svc-text small ion-icon { font-size:12px; color:var(--text-muted); }
    .svc-price { display:flex; flex-direction:column; align-items:center; gap:1px; min-width:64px; flex-shrink:0; text-align:center; }
    .svc-price b { font-size:12px; font-weight:800; color:var(--text-primary); direction:ltr; white-space:nowrap; }
    .svc-price small { font-size:10px; color:var(--text-muted); }
    .svc-go {
      width:32px; height:32px; border-radius:8px;
      background: var(--accent);
      color: var(--accent-contrast);
      display:inline-flex; align-items:center; justify-content:center;
      font-size:15px; flex-shrink:0;
    }
  `],
})
export class ServicesPage implements OnInit {
  private api = inject(ApiService);
  t = fa.servicesList;
  items = signal<Service[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  hasMore = signal(true);
  private page = 1;
  private limit = 20;
  error = signal('');
  displayItems = computed(() => (this.items().length ? this.items() : DEMO));

  constructor() {
    addIcons({ chevronBackOutline, cutOutline, sparklesOutline, personOutline, ribbonOutline, timeOutline });
  }

  ngOnInit() { this.load(true); }

  onScroll() { if (!this.hasMore() || this.loading() || this.loadingMore()) return; this.load(false); }

  load(reset = true) {
    if (reset) { this.page = 1; this.hasMore.set(true); this.loading.set(true); } else this.loadingMore.set(true);
    this.error.set('');
    this.api.services.list({ page: this.page, limit: this.limit }).subscribe({
      next: (v) => {
        const p = unwrapPaginated<Service>(v);
        const arr = p.data as Service[];
        if (reset) this.items.set(arr);
        else this.items.update((a) => [...a, ...arr]);
        const more = arr.length === this.limit && (p.total ? this.items().length < p.total : true);
        if (arr.length) this.page++;
        this.hasMore.set(more);
        this.loading.set(false); this.loadingMore.set(false);
      },
      error: () => {
        if (reset) this.items.set([]);
        this.hasMore.set(false);
        this.loading.set(false); this.loadingMore.set(false);
      },
    });
  }

  formatPrice(n: number) {
    try { return new Intl.NumberFormat('fa-IR').format(n); } catch { return String(n); }
  }

  iconFor(s: Service) {
    const k = (s.icon ?? s.name ?? '').toLowerCase();
    if (k.includes('spark')) return 'sparkles-outline';
    if (k.includes('ribbon') || k.includes('award') || k.includes('داماد')) return 'ribbon-outline';
    if (k.includes('person') || k.includes('پاکساز') || k.includes('پوست')) return 'person-outline';
    return 'cut-outline';
  }
}

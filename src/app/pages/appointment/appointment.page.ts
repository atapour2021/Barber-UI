import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Appointment, Barber } from '../../core/models';
import { fa } from '../../core/i18n/fa';

type Filter = 'upcoming' | 'past' | 'cancelled';

const DEMO: Appointment[] = [
  { id: '1', date: new Date().toISOString().slice(0, 10), startTime: '14:30', endTime: '15:15', status: 'confirmed', notes: null, userId: '', barberId: 'b1', serviceId: 's1', barber: { id: 'b1', fullName: 'رضا کاظمی', profileImage: 'https://i.pravatar.cc/150?u=reza', status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '' } as Barber, service: { id: 's1', name: 'کوتاهی و استایل', price: 350000, duration: 45, barberId: '' } as never },
  { id: '2', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), startTime: '17:00', endTime: '17:30', status: 'confirmed', notes: null, userId: '', barberId: 'b2', serviceId: 's2', barber: { id: 'b2', fullName: 'مهدی تهرانی', profileImage: 'https://i.pravatar.cc/150?u=mehdi', status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '' } as Barber, service: { id: 's2', name: 'اصلاح و فرم ریش', price: 280000, duration: 20, barberId: '' } as never },
  { id: '3', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), startTime: '19:30', endTime: '21:30', status: 'confirmed', notes: null, userId: '', barberId: 'b3', serviceId: 's3', barber: { id: 'b3', fullName: 'علی رضایی', profileImage: 'https://i.pravatar.cc/150?u=ali', status: 'active', isAvailable: true, isActive: true, barbershopId: '', userId: '' } as Barber, service: { id: 's3', name: 'پکیج کامل داماد', price: 1850000, duration: 120, barberId: '' } as never },
];

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [RouterLink, IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap turns-wrap" dir="rtl">
        <div class="turns-header">
          <h1>{{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
        </div>
        <div class="filter-row" role="tablist">
          <button type="button" class="filter-pill" [class.active]="filter() === 'upcoming'" (click)="filter.set('upcoming')" role="tab" [attr.aria-selected]="filter() === 'upcoming'">{{ t.upcoming }}</button>
          <button type="button" class="filter-pill" [class.active]="filter() === 'past'" (click)="filter.set('past')" role="tab" [attr.aria-selected]="filter() === 'past'">{{ t.past }}</button>
          <button type="button" class="filter-pill" [class.active]="filter() === 'cancelled'" (click)="filter.set('cancelled')" role="tab" [attr.aria-selected]="filter() === 'cancelled'">{{ t.cancelled }}</button>
        </div>
        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ c.loading }}</p></div>
        } @else if (!filtered().length) {
          <div class="dark-card" style="text-align:center;padding:20px"><p class="muted" style="margin:0">{{ t.empty }}</p></div>
        } @else {
          <div class="turn-grid">
            @for (a of filtered(); track a.id) {
              <a class="turn-card" [routerLink]="['/tabs/appointment', a.id]">
                <div class="turn-time">
                  <b dir="ltr">{{ a.startTime }}</b>
                  <small>{{ dateLabel(a.date) }}</small>
                </div>
                <div class="turn-barber">
                  <div class="turn-text">
                    <b>{{ barberName(a) }}</b>
                    <small>{{ serviceName(a) }}</small>
                  </div>
                  <img [src]="avatar(a)" (error)="onImgError($event)" alt="" />
                </div>
              </a>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .turns-wrap { gap: 16px; padding-top: 14px; }
    .turns-header { text-align:right; }
    .turns-header h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .turns-header p { margin:6px 0 0; font-size:11px; color:var(--text-secondary); }
    .filter-row { display:flex; gap:8px; align-items:center; justify-content:flex-start; flex-wrap:wrap; margin-top:2px; }
    .filter-pill { border:1px solid var(--card-border); background:var(--card-bg); color:var(--text-secondary); border-radius:8px; padding:7px 14px; font-size:11px; font-weight:700; font-family:inherit; cursor:pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; line-height:1; }
    .filter-pill.active { background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .turn-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
    @media (max-width: 640px) { .turn-grid { grid-template-columns:1fr; } }
    .turn-card { display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:14px 14px; min-height:72px; transition: border-color 0.15s; text-decoration:none; }
    .turn-card:hover { border-color:var(--card-border-2); }
    .turn-barber { display:flex; align-items:center; gap:10px; flex:1; min-width:0; justify-content:flex-end; }
    .turn-barber img { width:44px; height:44px; border-radius:10px; object-fit:cover; background:#1e2a44; flex-shrink:0; }
    .turn-text { display:flex; flex-direction:column; gap:3px; text-align:right; min-width:0; align-items:flex-end; }
    .turn-text b { font-size:12px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .turn-text small { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .turn-time { display:flex; flex-direction:column; gap:2px; text-align:left; min-width:64px; flex-shrink:0; align-items:flex-start; }
    .turn-time b { font-size:13px; font-weight:800; color:var(--accent); direction:ltr; line-height:1; }
    .turn-time small { font-size:11px; color:var(--text-secondary); line-height:1; }
  `],
})
export class AppointmentPage implements OnInit {
  private api = inject(ApiService);
  t = fa.turns;
  c = fa.common;
  loading = signal(false);
  filter = signal<Filter>('upcoming');
  items = signal<Appointment[]>([]);
  filtered = computed(() => {
    const f = this.filter();
    const arr = this.items();
    if (f === 'cancelled') return arr.filter(a => a.status === 'cancelled');
    const today = new Date().toISOString().slice(0, 10);
    if (f === 'upcoming') return arr.filter(a => a.status !== 'cancelled' && a.date >= today);
    return arr.filter(a => a.status === 'cancelled' || a.date < today || a.status === 'completed');
  });
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.appointments.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v : ((v as { data: Appointment[] }).data ?? []);
        this.items.set((arr.length ? arr : DEMO) as Appointment[]);
        this.loading.set(false);
      },
      error: () => { this.items.set(DEMO as Appointment[]); this.loading.set(false); },
    });
  }
  barberName(a: Appointment) { return a.barber?.fullName ?? '—'; }
  serviceName(a: Appointment) { return a.service?.name ?? ''; }
  avatar(a: Appointment) { return (a.barber as Barber | undefined)?.profileImage ?? `https://i.pravatar.cc/100?u=${a.barberId}`; }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=fallback'; }
  dateLabel(iso: string) {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (iso === today) return 'امروز';
    if (iso === tomorrow) return 'فردا';
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(iso + 'T12:00:00')); } catch { return iso; }
  }
}

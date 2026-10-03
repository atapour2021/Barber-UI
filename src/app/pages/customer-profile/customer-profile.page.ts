import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline, personCircleOutline, sparklesOutline, refreshOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline, cutOutline, calendarOutline, starOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { fa } from '../../core/i18n/fa';
import { jalaliFa } from '../../core/utils/persian-date';
import { extractMessage } from '../../core/utils/error';
import { CustomerProfileResponse } from '../../core/api/ai.api';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap cp-wrap" dir="rtl">
        <div class="cp-head">
          <h1><ion-icon name="sparkles-outline"></ion-icon> {{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
        </div>

        <div class="dark-card form-card">
          <label class="lbl">{{ t.selectCustomer }}</label>
          <div class="row">
            <input class="inp" [(ngModel)]="customerId" [placeholder]="t.customerIdPlaceholder" />
            <button type="button" class="cta" (click)="load()" [disabled]="loading() || !customerId.trim()">@if(loading()){<ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner>} @else { {{ t.analyze }} }</button>
          </div>
          @if(quick().length){
            <div class="chips">
              @for(u of quick(); track u.id){
                <button type="button" class="chip" [class.on]="customerId===u.id" (click)="pick(u.id)">{{u.label}}</button>
              }
            </div>
          }
        </div>

        @if(loading()){
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ t.analyzing }}</p></div>
        }
        @if(errorMsg()){
          <div class="alert-error" style="text-align:center"><ion-icon name="alert-circle-outline" style="margin-inline-end:6px"></ion-icon>{{errorMsg()}}<div style="margin-top:10px"><button type="button" class="cta cta-sm" (click)="load()">{{ fa.common.retry }}</button></div></div>
        }
        @if(data(); as d){
          <div class="dark-card summary-card">
            <div class="persona"><ion-icon name="person-circle-outline"></ion-icon> {{ d.personaFa }}</div>
            <p class="summary">{{ d.summaryFa }}</p>
            @if(d.meta){<small class="muted">{{d.meta.provider}} · {{d.meta.model}}</small>}
          </div>

          <div class="grid2">
            <div class="dark-card stat-card"><b>{{ d.stats.totalAppointments }}</b><small>کل نوبت‌ها</small></div>
            <div class="dark-card stat-card"><b>{{ d.stats.completed }}</b><small>تکمیل شده</small></div>
            <div class="dark-card stat-card"><b>{{ d.stats.cancelled }}</b><small>لغو</small></div>
            <div class="dark-card stat-card"><b>{{ d.stats.noShow }}</b><small>عدم حضور</small></div>
          </div>
          <div class="dark-card"><div class="k">خدمت محبوب</div><div class="v">{{ d.stats.favoriteServiceNames.join('، ') || '—' }}</div><div class="k" style="margin-top:8px">آرایشگر محبوب</div><div class="v">{{ d.stats.favoriteBarberName || '—' }}</div><div class="k" style="margin-top:8px">روز ترجیحی</div><div class="v">{{ d.stats.preferredDayOfWeek || '—' }}</div><div class="k" style="margin-top:8px">میانگین فاصله</div><div class="v">{{ d.stats.avgDaysBetween ? (d.stats.avgDaysBetween | number:'1.0-1') + ' روز' : '—' }}</div></div>

          <div class="dark-card"><h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="checkmark-circle-outline"></ion-icon> {{ t.insights }}</h3>@if(d.insightsFa.length){<ul class="insights">@for(x of d.insightsFa; track x){<li>{{x}}</li>}</ul>} @else {<p class="muted" style="margin:0">{{ t.empty }}</p>}</div>

          <div class="dark-card"><h3 style="margin:0 0 4px;font-size:13px">{{ t.preferences }}</h3><p class="muted" style="margin:0">{{ d.preferencesFa }}</p></div>

          <div class="section">
            <div class="section-head"><h3><ion-icon name="cut-outline"></ion-icon> {{ t.recommendations }}</h3></div>
            @if(d.recommendations.length){
              <div class="rec-grid">
                @for(r of d.recommendations; track r.titleFa + r.serviceId){
                  <div class="rec-card">
                    <b>{{ r.titleFa || r.title }}</b>
                    <p class="muted" style="margin:6px 0 0">{{ r.reasonFa || r.reason }}</p>
                    <small class="muted">{{ r.confidence | number:'1.0-2' }} · {{ (r.tags || []).join('، ') }}</small>
                    @if(r.serviceId){<a class="pill-link" [routerLink]="['/tabs/booking']" [queryParams]="{serviceId: r.serviceId}">رزرو با این خدمت</a>}
                  </div>
                }
              </div>
            } @else {<p class="muted" style="text-align:center">{{ t.empty }}</p>}
          </div>

          <div class="dark-card">
            <h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="calendar-outline"></ion-icon> {{ t.recent }}</h3>
            @if(d.recentAppointments.length){
              <div class="recent-list">@for(a of d.recentAppointments; track a.date + a.serviceName){<div class="recent-row"><span>{{jalaliFa(a.date)}}</span><span>{{a.serviceName || '—'}}</span><span>{{a.barberName || '—'}}</span><span class="pill">{{a.status}}</span></div>}</div>
            } @else {<p class="muted" style="margin:0">{{ t.empty }}</p>}
          </div>

          <div class="dark-card" style="display:flex;gap:8px;justify-content:center">
            <a class="pill-link ghost" [routerLink]="['/tabs/appointment']">نوبت‌ها</a>
            <a class="pill-link" [routerLink]="['/tabs/booking']">رزرو</a>
          </div>
        } @else if(!loading() && !errorMsg()){
          <div class="empty-state"><ion-icon name="people-outline" style="font-size:32px;color:var(--text-muted)"></ion-icon><p class="muted">{{ t.noCustomer }}</p></div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .cp-wrap{max-width:720px;gap:14px;padding-top:14px}
    .cp-head h1{margin:0;font-size:22px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;justify-content:flex-end}
    .cp-head p{margin:6px 0 0;font-size:11px;color:var(--text-secondary);text-align:right}
    .form-card{display:flex;flex-direction:column;gap:10px;padding:14px}
    .lbl{font-size:11px;font-weight:700;color:var(--text-primary);text-align:right}
    .row{display:flex;gap:8px}
    .inp{flex:1;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px 12px;color:var(--text-primary);font-family:inherit;font-size:13px;outline:none;direction:ltr;text-align:left}
    .cta{min-height:42px;border:none;border-radius:10px;background:var(--accent);color:var(--accent-contrast);font-size:12px;font-weight:800;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;white-space:nowrap}
    .cta:disabled{opacity:.55}
    .cta-sm{padding:8px 12px;min-height:36px}
    .chips{display:flex;flex-wrap:wrap;gap:6px}
    .chip{border:1px solid var(--card-border);background:var(--card-bg);color:var(--text-primary);border-radius:999px;padding:6px 10px;font-size:11px;cursor:pointer}
    .chip.on{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
    .summary-card{text-align:right;padding:14px}
    .persona{font-size:12px;font-weight:800;color:var(--accent);display:flex;align-items:center;gap:6px;justify-content:flex-end}
    .summary{margin:8px 0 0;font-size:13px;color:var(--text-primary);line-height:1.7}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
    .stat-card{text-align:center;padding:14px 8px;display:flex;flex-direction:column;gap:4px}
    .stat-card b{font-size:18px;color:var(--text-primary)}
    .stat-card small{font-size:11px;color:var(--text-secondary)}
    .k{font-size:11px;color:var(--text-secondary);text-align:right}
    .v{font-size:13px;color:var(--text-primary);text-align:right;font-weight:700}
    .insights{margin:0;padding:0 16px 0 0;display:flex;flex-direction:column;gap:6px}
    .insights li{font-size:12px;color:var(--text-primary);text-align:right}
    .rec-grid{display:grid;gap:10px}
    .rec-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;text-align:right}
    .rec-card b{font-size:13px;color:var(--text-primary)}
    .pill-link{display:inline-flex;align-items:center;justify-content:center;background:var(--accent);color:var(--accent-contrast);border-radius:999px;padding:8px 12px;font-size:11px;font-weight:700;text-decoration:none}
    .pill-link.ghost{background:transparent;border:1px solid var(--card-border);color:var(--text-primary)}
    .recent-list{display:flex;flex-direction:column;gap:6px}
    .recent-row{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:center;font-size:11px;color:var(--text-primary);background:var(--card-bg-2);border:1px solid var(--card-border);border-radius:8px;padding:8px}
    .pill{background:var(--card-bg);border:1px solid var(--card-border);border-radius:999px;padding:2px 8px;font-size:10px}
    .empty-state{text-align:center;padding:24px;color:var(--text-muted)}
  `],
})
export class CustomerProfilePage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  fa = fa;
  t = fa.customerProfile;
  customerId = '';
  loading = signal(false);
  errorMsg = signal('');
  data = signal<CustomerProfileResponse | null>(null);
  quick = signal<Array<{ id: string; label: string }>>([]);
  jalaliFa(v: string){ try{ return jalaliFa(v); }catch{ return v; } }
  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('customerId') || this.route.snapshot.paramMap.get('customerId') || '';
    if (q) { this.customerId = q; this.load(); }
    this.api.appointments.list().subscribe({
      next: (v: any) => {
        const arr = Array.isArray(v) ? v : (v?.data ?? []);
        const m = new Map<string, string>();
        for (const a of arr as any[]) {
          const uid = a.userId ?? a.user?.id;
          const name = a.user ? `${a.user.name ?? ''} ${a.user.family ?? ''}`.trim() || a.user.username : uid?.slice(0, 8);
          if (uid && !m.has(uid) && name) m.set(uid, name);
          if (m.size >= 8) break;
        }
        this.quick.set([...m.entries()].map(([id, label]) => ({ id, label: `${label} · ${id.slice(0, 6)}` })));
      }, error: () => {},
    });
  }
  pick(id: string) { this.customerId = id; this.load(); }
  load() {
    const id = this.customerId.trim();
    if (!id) { this.toast.warning(this.t.noCustomer); return; }
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(id)) { this.errorMsg.set('شناسه مشتری نامعتبر است'); return; }
    this.loading.set(true); this.errorMsg.set(''); this.data.set(null);
    this.api.ai.customerProfile(id).subscribe({
      next: (v) => { this.data.set(v); this.loading.set(false); },
      error: (e) => { const m = extractMessage(e, this.t.failed); this.errorMsg.set(m); this.loading.set(false); this.toast.error(m); },
    });
  }
}

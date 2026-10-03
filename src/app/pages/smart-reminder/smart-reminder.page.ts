import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sparklesOutline, calendarOutline, timeOutline, alertCircleOutline, checkmarkCircleOutline, cutOutline, notificationsOutline, refreshOutline, peopleOutline, personCircleOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { fa } from '../../core/i18n/fa';
import { jalaliFa, jalaliFaWithTime } from '../../core/utils/persian-date';
import { extractMessage } from '../../core/utils/error';
import { SmartReminderResponse } from '../../core/api/ai.api';

@Component({
  selector: 'app-smart-reminder',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap sr-wrap" dir="rtl">
        <div class="sr-head">
          <h1><ion-icon name="sparkles-outline"></ion-icon> {{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
        </div>

        <div class="dark-card cta-card">
          <button type="button" class="cta cta-main" (click)="loadMe()" [disabled]="loadingMe()">
            @if(loadingMe()){<ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner>} @else { {{ t.myReminder }} }
          </button>
          <small class="muted" style="text-align:center;display:block;margin-top:6px">{{ auth.user()?.name ?? '' }} {{ auth.user()?.family ?? '' }}</small>
        </div>

        @if(canLookup()){
          <div class="dark-card form-card">
            <label class="lbl">{{ t.forCustomer }}</label>
            <p class="muted" style="margin:0 0 8px;font-size:11px;text-align:right">{{ t.barberHint }}</p>
            <div class="row">
              <input class="inp" [(ngModel)]="customerId" placeholder="customerId (uuid)" />
              <button type="button" class="cta" (click)="loadCustomer()" [disabled]="loadingCust() || !customerId.trim()">@if(loadingCust()){<ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner>} @else { {{ t.load }} }</button>
            </div>
            @if(quick().length){
              <div class="chips">@for(u of quick(); track u.id){<button type="button" class="chip" [class.on]="customerId===u.id" (click)="pick(u.id)">{{u.label}}</button>}</div>
            }
          </div>
        }

        @if(loadingMe() || loadingCust()){
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ t.analyzing }}</p></div>
        }
        @if(errorMsg()){
          <div class="alert-error" style="text-align:center"><ion-icon name="alert-circle-outline" style="margin-inline-end:6px"></ion-icon>{{errorMsg()}}<div style="margin-top:10px"><button type="button" class="cta cta-sm" (click)="retry()">{{ t.retry }}</button></div></div>
        }
        @if(data(); as d){
          <div class="dark-card hero-card">
            <div class="hero-top">
              <span class="pill-accent"><ion-icon name="calendar-outline"></ion-icon> {{ t.predictedDate }}</span>
              <b class="pred-date" dir="ltr">{{ d.predictedDate ? jalaliFa(d.predictedDate) : '—' }}</b>
              @if(d.predictedDaysFromNow != null){<small class="muted">{{ d.predictedDaysFromNow }} {{ t.days }} · {{ d.predictedDaysFromNow <= 1 ? t.soon : '' }}</small>}
            </div>
            <div class="grid2">
              <div class="mini"><span class="k">{{ t.frequency }}</span><b>{{ d.frequencyLabelFa }}</b></div>
              <div class="mini"><span class="k">{{ t.confidence }}</span><b>{{ (d.confidence*100) | number:'1.0-0' }}%</b></div>
              <div class="mini"><span class="k">{{ t.daysSinceLast }}</span><b>{{ d.stats.daysSinceLastVisit ?? '—' }}</b></div>
              <div class="mini"><span class="k">{{ t.avgInterval }}</span><b>{{ d.stats.avgDaysBetween ? (d.stats.avgDaysBetween | number:'1.0-1') + ' ' + t.days : '—' }}</b></div>
            </div>
            @if(d.meta){<small class="muted">{{d.meta.provider}} · {{d.meta.model}}</small>}
          </div>

          <div class="dark-card msg-card">
            <h3 style="margin:0 0 6px;font-size:13px"><ion-icon name="checkmark-circle-outline"></ion-icon> {{ t.messageLabel }}</h3>
            <p class="msg">{{ d.messageFa }}</p>
            <div class="msg-actions">
              @if(isMe()){
                <button type="button" class="cta" (click)="sendMe()" [disabled]="sending()">@if(sending()){<ion-spinner name="crescent" style="--color:#0b101e;width:16px;height:16px"></ion-spinner>} @else { <ion-icon name="notifications-outline" style="margin-inline-end:6px"></ion-icon> {{ t.sendReminder }} }</button>
                @if(d.predictedDate){<a class="pill-link" [routerLink]="['/tabs/booking']" [queryParams]="{date: d.predictedDate}">{{ t.bookedHint }}</a>}
              } @else {
                <button type="button" class="cta" (click)="sendCustomer()" [disabled]="sending()">@if(sending()){<ion-spinner name="crescent" style="--color:#0b101e;width:16px;height:16px"></ion-spinner>} @else { {{ t.sendReminder }} }</button>
              }
              <a class="pill-link ghost" routerLink="/tabs/notifications">اعلان‌ها</a>
            </div>
          </div>

          <div class="grid2">
            <div class="dark-card stat"><b>{{ d.stats.totalAppointments }}</b><small>کل نوبت‌ها</small></div>
            <div class="dark-card stat"><b>{{ d.stats.completed }}</b><small>تکمیل شده</small></div>
            <div class="dark-card stat"><b>{{ d.stats.pending + d.stats.confirmed }}</b><small>در انتظار</small></div>
            <div class="dark-card stat"><b>{{ d.stats.cancelled }}</b><small>لغو</small></div>
          </div>
          <div class="dark-card">
            <div class="k">{{ t.lastVisit }}</div><div class="v">{{ d.stats.lastVisitAt ? jalaliFa(d.stats.lastVisitAt) : '—' }}</div>
            <div class="k" style="margin-top:8px">{{ t.favoriteService }}</div><div class="v">{{ d.stats.favoriteServiceNames.join('، ') || '—' }}</div>
            <div class="k" style="margin-top:8px">{{ t.preferredDay }}</div><div class="v">{{ d.stats.preferredDayOfWeek || '—' }}</div>
          </div>

          <div class="dark-card"><h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="person-circle-outline"></ion-icon> {{ t.insights }}</h3>@if(d.insightsFa.length){<ul class="insights">@for(x of d.insightsFa; track x){<li>{{x}}</li>}</ul>} @else {<p class="muted" style="margin:0">—</p>}</div>

          <div class="section">
            <div class="section-head"><h3><ion-icon name="cut-outline"></ion-icon> {{ t.suggested }}</h3></div>
            @if(d.suggestedServices.length){
              <div class="rec-grid">@for(s of d.suggestedServices; track s.titleFa + s.serviceId){<div class="rec-card"><b>{{ s.titleFa }}</b><p class="muted" style="margin:6px 0 0">{{ s.reasonFa }}</p><small class="muted">{{ s.confidence }}</small>@if(s.serviceId){<a class="pill-link" [routerLink]="['/tabs/booking']" [queryParams]="{serviceId: s.serviceId, date: d.predictedDate ?? undefined}">{{ t.bookedHint }}</a>}</div>}</div>
            } @else {<p class="muted" style="text-align:center">—</p>}
          </div>

          <div class="dark-card"><h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="time-outline"></ion-icon> {{ fa.customerProfile.recent }}</h3>@if(d.recentAppointments.length){<div class="recent-list">@for(a of d.recentAppointments; track a.date + a.serviceName){<div class="recent-row"><span>{{jalaliFa(a.date)}}</span><span>{{a.serviceName || '—'}}</span><span>{{a.barberName || '—'}}</span><span class="pill">{{a.status}}</span></div>}</div>} @else {<p class="muted" style="margin:0">{{ fa.customerProfile.empty }}</p>}</div>
        } @else if(!loadingMe() && !loadingCust() && !errorMsg()){
          <div class="empty-state"><ion-icon name="people-outline" style="font-size:32px;color:var(--text-muted)"></ion-icon><p class="muted">{{ t.myReminder }}</p></div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .sr-wrap{max-width:720px;gap:14px;padding-top:14px}
    .sr-head h1{margin:0;font-size:22px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;justify-content:flex-end}
    .sr-head p{margin:6px 0 0;font-size:11px;color:var(--text-secondary);text-align:right}
    .cta-card{padding:14px;text-align:center}
    .cta-main{width:100%}
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
    .hero-card{padding:14px;display:flex;flex-direction:column;gap:10px;text-align:right}
    .hero-top{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
    .pill-accent{display:inline-flex;align-items:center;gap:6px;background:rgba(245,158,11,.15);color:var(--accent);border:1px solid rgba(245,158,11,.25);border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700}
    .pred-date{font-size:22px;font-weight:800;color:var(--text-primary)}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
    .mini{background:var(--card-bg-2);border:1px solid var(--card-border);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:4px;text-align:right}
    .mini b{font-size:13px;color:var(--text-primary)}
    .k{font-size:11px;color:var(--text-secondary);text-align:right}
    .v{font-size:13px;color:var(--text-primary);text-align:right;font-weight:700}
    .msg-card{padding:14px;text-align:right}
    .msg{margin:0;font-size:13px;color:var(--text-primary);line-height:1.8;background:var(--card-bg-2);border:1px solid var(--card-border);border-radius:10px;padding:12px}
    .msg-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;flex-wrap:wrap}
    .stat{text-align:center;padding:14px 8px;display:flex;flex-direction:column;gap:4px}
    .stat b{font-size:18px;color:var(--text-primary)}
    .stat small{font-size:11px;color:var(--text-secondary)}
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
export class SmartReminderPage implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private viewRole = inject(ViewRoleService);
  fa = fa;
  t = fa.smartReminder;
  customerId = '';
  loadingMe = signal(false);
  loadingCust = signal(false);
  sending = signal(false);
  errorMsg = signal('');
  data = signal<SmartReminderResponse | null>(null);
  isMe = signal(true);
  quick = signal<Array<{ id: string; label: string }>>([]);
  canLookup = computed(() => this.viewRole.activeView() === 'barber' || this.viewRole.activeView() === 'admin' || this.auth.isAdmin() || this.auth.isBarber());
  ngOnInit() {
    this.loadMe();
    if (this.canLookup()) {
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
  }
  pick(id: string) { this.customerId = id; this.loadCustomer(); }
  retry() { if (this.isMe()) this.loadMe(); else this.loadCustomer(); }
  loadMe() {
    this.loadingMe.set(true); this.errorMsg.set(''); this.isMe.set(true);
    this.api.ai.smartReminderMe().subscribe({
      next: (v) => { this.data.set(v); this.loadingMe.set(false); },
      error: (e) => { const m = extractMessage(e, fa.errors.generic); this.errorMsg.set(m); this.loadingMe.set(false); this.toast.error(m); },
    });
  }
  loadCustomer() {
    const id = this.customerId.trim();
    if (!id) { this.toast.warning(this.t.barberHint); return; }
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(id)) { this.errorMsg.set('شناسه مشتری نامعتبر است'); return; }
    this.loadingCust.set(true); this.errorMsg.set(''); this.isMe.set(false);
    this.api.ai.smartReminderCustomer(id).subscribe({
      next: (v) => { this.data.set(v); this.loadingCust.set(false); },
      error: (e) => { const m = extractMessage(e, fa.errors.generic); this.errorMsg.set(m); this.loadingCust.set(false); this.toast.error(m); },
    });
  }
  sendMe() {
    if (this.sending()) return;
    this.sending.set(true);
    this.api.ai.sendSmartReminderMe().subscribe({
      next: () => { this.sending.set(false); this.toast.success(this.t.sendSuccess); },
      error: (e) => { this.sending.set(false); this.toast.error(extractMessage(e, this.t.sendFailed)); },
    });
  }
  jalaliFa(v:string){ try{ return jalaliFa(v); }catch{ return v; } }
  sendCustomer() {
    const id = this.customerId.trim() || (this.data()?.customer.id ?? '');
    if (!id) { this.toast.warning(this.t.barberHint); return; }
    if (this.sending()) return;
    this.sending.set(true);
    this.api.ai.sendSmartReminderCustomer(id).subscribe({
      next: () => { this.sending.set(false); this.toast.success(this.t.sendSuccess); },
      error: (e) => { this.sending.set(false); this.toast.error(extractMessage(e, this.t.sendFailed)); },
    });
  }
}

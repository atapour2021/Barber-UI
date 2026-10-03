import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { analyticsOutline, alertCircleOutline, sparklesOutline, refreshOutline, trendingUpOutline, trendingDownOutline, removeOutline, bulbOutline, warningOutline, peopleOutline, calendarOutline, cashOutline, cutOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { BusinessInsightsResponse } from '../../core/api/ai.api';

@Component({
  selector: 'app-business-insights',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap bi-wrap" dir="rtl">
        <div class="bi-head">
          <h1><ion-icon name="analytics-outline"></ion-icon> {{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
        </div>

        <div class="dark-card filters">
          <div class="chips">
            <button type="button" class="chip" [class.on]="days===7" (click)="pickDays(7)">{{ t.quick7 }}</button>
            <button type="button" class="chip" [class.on]="days===30" (click)="pickDays(30)">{{ t.quick30 }}</button>
            <button type="button" class="chip" [class.on]="days===90" (click)="pickDays(90)">{{ t.quick90 }}</button>
          </div>
          <div class="row">
            <label class="f"><span>{{ t.from }}</span><input type="date" [(ngModel)]="from" /></label>
            <label class="f"><span>{{ t.to }}</span><input type="date" [(ngModel)]="to" /></label>
            <label class="f" style="min-width:92px;flex:0"><span>{{ t.days }}</span><input type="number" [(ngModel)]="days" min="7" max="365" placeholder="30" /></label>
          </div>
          <button type="button" class="cta" (click)="load()" [disabled]="loading()">@if(loading()){<ion-spinner name="crescent" style="--color:#0b101e;width:18px;height:18px"></ion-spinner>} @else { <ion-icon name="sparkles-outline" style="margin-inline-end:6px"></ion-icon> {{ t.analyze }} }</button>
          @if(data()?.periodLabelFa){<small class="muted" style="text-align:center;display:block">{{ data()!.periodLabelFa }}</small>}
        </div>

        @if(loading()){
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{ t.analyzing }}</p></div>
        }
        @if(errorMsg()){
          <div class="alert-error" style="text-align:center"><ion-icon name="alert-circle-outline" style="margin-inline-end:6px"></ion-icon>{{errorMsg()}}<div style="margin-top:10px"><button type="button" class="cta cta-sm" (click)="load()">{{ t.retry }}</button></div></div>
        }
        @if(data(); as d){
          @if(d.meta){<small class="muted" style="text-align:right;display:block"><ion-icon name="sparkles-outline" style="margin-inline-end:4px"></ion-icon> {{ t.provider }}: {{ d.meta.provider }} · {{ d.meta.model }}</small>}
          <div class="dark-card summary-card">
            <h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="checkmark-circle-outline"></ion-icon> {{ t.summary }}</h3>
            <p class="summary">{{ d.summaryFa }}</p>
          </div>

          <div class="grid2">
            <div class="dark-card kpi"><span class="k">{{ t.totalAppointments }}</span><b>{{ d.aggregates.totals.totalAppointments }}</b><small class="muted">{{ t.pending }} {{ d.aggregates.totals.pending }} · {{ t.confirmed }} {{ d.aggregates.totals.confirmed }}</small></div>
            <div class="dark-card kpi"><span class="k">{{ t.revenue }}</span><b>{{ d.aggregates.revenue.total | number:'1.0-0' }}</b><small class="muted">{{ t.avgPerCompleted }} {{ d.aggregates.revenue.avgPerCompleted | number:'1.0-0' }}</small></div>
            <div class="dark-card kpi"><span class="k">{{ t.cancellationRate }}</span><b>{{ (d.aggregates.rates.cancellationRate*100) | number:'1.1-1' }}%</b><small class="muted">{{ t.completionRate }} {{ (d.aggregates.rates.completionRate*100) | number:'1.0-0' }}%</small></div>
            <div class="dark-card kpi"><span class="k">{{ t.customers }}</span><b>{{ d.aggregates.customers.activeCustomersInPeriod }}</b><small class="muted">{{ t.activeCustomers }} · {{ t.newCustomers }} {{ d.aggregates.customers.newCustomersInPeriod }}</small></div>
          </div>
          <div class="grid2">
            <div class="dark-card mini-kpi"><span class="k">لغو</span><b>{{ d.aggregates.totals.cancelled }}</b></div>
            <div class="dark-card mini-kpi"><span class="k">عدم حضور</span><b>{{ d.aggregates.totals.noShow }}</b></div>
            <div class="dark-card mini-kpi"><span class="k">تکمیل</span><b>{{ d.aggregates.totals.completed }}</b></div>
            <div class="dark-card mini-kpi"><span class="k">{{ t.repeatRate }}</span><b>{{ d.aggregates.customers.repeatRate != null ? ((d.aggregates.customers.repeatRate*100) | number:'1.0-0') + '%' : '—' }}</b></div>
          </div>

          @if(d.aggregates.dailyBreakdown.length){
            <div class="dark-card">
              <h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="calendar-outline"></ion-icon> {{ t.daily }}</h3>
              <div style="overflow-x:auto">
                <table class="tbl">
                  <thead><tr><th>تاریخ</th><th>{{ t.count }}</th><th>{{ t.revenue }}</th></tr></thead>
                  <tbody>@for(r of d.aggregates.dailyBreakdown; track r.date){<tr><td dir="ltr" style="text-align:left">{{ r.date }}</td><td>{{ r.count }}</td><td>{{ r.revenue | number:'1.0-0' }}</td></tr>}</tbody>
                </table>
              </div>
            </div>
          }

          @if(d.aggregates.topServices.length){
            <div class="dark-card">
              <h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="cut-outline"></ion-icon> {{ t.topServices }}</h3>
              @for(s of d.aggregates.topServices; track s.name){<div class="row2"><span>{{ s.name }}</span><span class="pill">{{ s.count }} · {{ s.revenue | number:'1.0-0' }}</span></div>}
            </div>
          }
          @if(d.aggregates.topBarbers.length){
            <div class="dark-card">
              <h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="people-outline"></ion-icon> {{ t.topBarbers }}</h3>
              @for(b of d.aggregates.topBarbers; track b.name){<div class="row2"><span>{{ b.name }}</span><span class="pill">{{ b.count }} · {{ (b.completionRate*100) | number:'1.0-0' }}%</span></div>}
            </div>
          }

          <div class="dark-card"><h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="bulb-outline"></ion-icon> {{ t.insights }}</h3>@if(d.insightsFa.length){<ul class="insights">@for(x of d.insightsFa; track x){<li>{{x}}</li>}</ul>} @else {<p class="muted" style="margin:0">—</p>}</div>

          @if(d.trends.length){
            <div class="dark-card"><h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="analytics-outline"></ion-icon> {{ t.trends }}</h3><div class="trend-list">@for(tr of d.trends; track tr.labelFa + tr.period){<div class="trend"><span class="trend-ico"><ion-icon [name]="tr.direction==='up' ? 'trending-up-outline' : tr.direction==='down' ? 'trending-down-outline' : 'remove-outline'"></ion-icon></span><div class="trend-main"><b>{{ tr.labelFa }}</b><small class="muted">{{ tr.detailFa ?? '' }} · {{ tr.period }}</small></div><span class="pill" [class.up]="tr.direction==='up'" [class.down]="tr.direction==='down'">{{ tr.changePercent != null ? (tr.changePercent | number:'1.1-1') + '%' : '—' }}</span></div>}</div></div>
          }
          @if(d.anomalies.length){
            <div class="dark-card"><h3 style="margin:0 0 8px;font-size:13px"><ion-icon name="warning-outline"></ion-icon> {{ t.anomalies }}</h3>@for(a of d.anomalies; track a.titleFa){<div class="anom"><b>{{ a.titleFa }} <span class="pill sev" [class.high]="a.severity==='high'" [class.med]="a.severity==='medium'">{{ a.severity }}</span></b><p class="muted" style="margin:4px 0 0">{{ a.detailFa }}</p></div>}</div>
          }
          @if(d.recommendations.length){
            <div class="section"><div class="section-head"><h3><ion-icon name="bulb-outline"></ion-icon> {{ t.recommendations }}</h3></div><div class="rec-grid">@for(r of d.recommendations; track r.titleFa){<div class="rec-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>{{ r.titleFa }}</b><span class="pill" [class.high]="r.priority==='high'" [class.med]="r.priority==='medium'">{{ r.priority }}</span></div><p class="muted" style="margin:6px 0 0">{{ r.reasonFa }}</p><div class="action">⚡ {{ r.actionFa }}</div>@if(r.expectedImpactFa){<small class="muted">اثر: {{ r.expectedImpactFa }}</small>}</div>}</div></div>
          }

          <div class="dark-card" style="display:flex;gap:8px;justify-content:center"><a class="pill-link ghost" routerLink="/admin">مدیریت</a><a class="pill-link" routerLink="/tabs/home">خانه</a><button type="button" class="pill-link" style="border:none;cursor:pointer" (click)="load()"><ion-icon name="refresh-outline" style="margin-inline-end:4px"></ion-icon> به‌روزرسانی</button></div>
        } @else if(!loading() && !errorMsg()){
          <div class="empty-state"><ion-icon name="analytics-outline" style="font-size:32px;color:var(--text-muted)"></ion-icon><p class="muted">{{ t.subtitle }}</p></div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .bi-wrap{max-width:780px;gap:14px;padding-top:14px}
    .bi-head h1{margin:0;font-size:22px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;justify-content:flex-end}
    .bi-head p{margin:6px 0 0;font-size:11px;color:var(--text-secondary);text-align:right}
    .filters{display:flex;flex-direction:column;gap:10px;padding:14px}
    .chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
    .chip{border:1px solid var(--card-border);background:var(--card-bg);color:var(--text-primary);border-radius:999px;padding:6px 10px;font-size:11px;cursor:pointer}
    .chip.on{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
    .row{display:flex;gap:8px;flex-wrap:wrap}
    .f{flex:1;display:flex;flex-direction:column;gap:4px;min-width:120px;text-align:right}
    .f span{font-size:11px;color:var(--text-secondary)}
    .f input{width:100%;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;color:var(--text-primary);font-family:inherit;font-size:13px;outline:none}
    .cta{min-height:42px;border:none;border-radius:10px;background:var(--accent);color:var(--accent-contrast);font-size:12px;font-weight:800;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;white-space:nowrap}
    .cta:disabled{opacity:.55}
    .cta-sm{padding:8px 12px;min-height:36px}
    .summary-card{text-align:right;padding:14px}
    .summary{margin:8px 0 0;font-size:13px;color:var(--text-primary);line-height:1.8}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
    .kpi{text-align:center;padding:14px 8px;display:flex;flex-direction:column;gap:4px}
    .kpi b{font-size:18px;color:var(--text-primary)}
    .mini-kpi{text-align:center;padding:10px 8px}
    .mini-kpi b{font-size:16px;color:var(--text-primary)}
    .k{font-size:11px;color:var(--text-secondary);text-align:center}
    .tbl{width:100%;border-collapse:collapse;font-size:12px}
    .tbl th{font-size:11px;color:var(--text-secondary);text-align:right;padding:6px 8px;border-bottom:1px solid var(--card-border)}
    .tbl td{padding:6px 8px;color:var(--text-primary);text-align:right;border-bottom:1px solid var(--card-border);font-weight:600}
    .row2{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--card-border);font-size:12px;color:var(--text-primary)}
    .row2:last-child{border-bottom:none}
    .pill{background:var(--card-bg-2);border:1px solid var(--card-border);border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700;color:var(--text-primary)}
    .pill.up{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.3);color:#22c55e}
    .pill.down{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.25);color:#ef4444}
    .pill.sev.high{background:rgba(239,68,68,.15);color:#ef4444}
    .pill.sev.med{background:rgba(245,158,11,.15);color:var(--accent)}
    .pill.high{background:rgba(239,68,68,.12);color:#ef4444;border-color:rgba(239,68,68,.2)}
    .pill.med{background:rgba(245,158,11,.12);color:var(--accent);border-color:rgba(245,158,11,.2)}
    .insights{margin:0;padding:0 16px 0 0;display:flex;flex-direction:column;gap:6px}
    .insights li{font-size:12px;color:var(--text-primary);text-align:right}
    .trend-list{display:flex;flex-direction:column;gap:8px}
    .trend{display:flex;align-items:center;gap:10px;background:var(--card-bg-2);border:1px solid var(--card-border);border-radius:10px;padding:10px}
    .trend-ico{width:32px;height:32px;border-radius:8px;background:var(--card-bg);border:1px solid var(--card-border);display:inline-flex;align-items:center;justify-content:center;color:var(--text-secondary)}
    .trend-main{flex:1;display:flex;flex-direction:column;gap:2px;text-align:right}
    .trend-main b{font-size:12px;color:var(--text-primary)}
    .anom{background:var(--card-bg-2);border:1px solid var(--card-border);border-radius:10px;padding:12px;margin-bottom:8px;text-align:right}
    .anom b{font-size:12px;color:var(--text-primary);display:flex;align-items:center;gap:6px;justify-content:flex-end}
    .rec-grid{display:grid;gap:10px}
    .rec-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;text-align:right}
    .rec-card b{font-size:13px;color:var(--text-primary)}
    .action{font-size:12px;color:var(--accent);font-weight:700}
    .pill-link{display:inline-flex;align-items:center;justify-content:center;background:var(--accent);color:var(--accent-contrast);border-radius:999px;padding:8px 12px;font-size:11px;font-weight:700;text-decoration:none}
    .pill-link.ghost{background:transparent;border:1px solid var(--card-border);color:var(--text-primary)}
    .empty-state{text-align:center;padding:24px;color:var(--text-muted)}
  `],
})
export class BusinessInsightsPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  t = fa.businessInsights;
  from = '';
  to = '';
  days = 30;
  loading = signal(false);
  errorMsg = signal('');
  data = signal<BusinessInsightsResponse | null>(null);
  ngOnInit() { this.load(); }
  pickDays(d: number) { this.days = d; const now = new Date(); const toStr = now.toISOString().slice(0, 10); const fromD = new Date(now.getTime() - (d - 1) * 86400000); this.from = fromD.toISOString().slice(0, 10); this.to = toStr; this.load(); }
  load() {
    this.loading.set(true); this.errorMsg.set('');
    const q: Record<string, unknown> = {};
    if (this.from) q['from'] = this.from;
    if (this.to) q['to'] = this.to;
    if (this.days && !this.from && !this.to) q['days'] = this.days;
    if (this.days) q['days'] = this.days;
    this.api.ai.businessInsights(q).subscribe({
      next: (v) => { this.data.set(v); this.loading.set(false); },
      error: (e) => { const m = extractMessage(e, this.t.failed); this.errorMsg.set(m); this.loading.set(false); this.toast.error(m); },
    });
  }
}

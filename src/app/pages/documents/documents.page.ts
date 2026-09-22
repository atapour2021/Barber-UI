import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trophyOutline, schoolOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Certificate } from '../../core/models';

type DocItem = { id: string; title: string; issuer: string; verified?: boolean; kind: 'trophy' | 'school' };

const DEMO: DocItem[] = [
  { id: '1', title: 'مدرک درجه یک آرایشگری', issuer: 'سازمان فنی و حرفه‌ای · ۱۴۰۲', verified: true, kind: 'trophy' },
  { id: '2', title: 'مسترکلاس فید تخصصی', issuer: 'آکادمی نیوباربر · ۱۴۰۴', kind: 'school' },
];

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap docs-wrap" dir="rtl">
        <div class="docs-head">
          <h1>مدارک و گواهی‌ها</h1>
          <p>سوابق حرفه‌ای قابل نمایش در پروفایل</p>
        </div>

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:22px"><ion-spinner></ion-spinner></div>
        } @else {
          <div class="docs-list">
            @for (d of items(); track d.id) {
              <div class="doc-card" [class.verified]="d.verified">
                <span class="doc-icon" [class.school]="d.kind === 'school'">
                  <ion-icon [name]="d.kind === 'school' ? 'school-outline' : 'trophy-outline'"></ion-icon>
                </span>
                <span class="doc-text">
                  <b>{{ d.title }}</b>
                  <small>{{ d.issuer }}</small>
                </span>
                @if (d.verified) {
                  <ion-icon name="shield-checkmark-outline" class="doc-check"></ion-icon>
                }
              </div>
            }
          </div>

          <button type="button" class="add-doc-btn" (click)="onAdd()">افزودن مدرک جدید</button>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .docs-wrap { gap: 14px; padding-top: 12px; max-width: 520px; }
    .docs-head { text-align:right; }
    .docs-head h1 { margin:0; font-size:22px; font-weight:800; color:var(--text-primary); }
    .docs-head p { margin:5px 0 0; font-size:11px; color:var(--text-secondary); }
    .docs-list { display:flex; flex-direction:column; gap:10px; width:100%; }
    .doc-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 14px;
      display:flex; align-items:center; gap:12px;
      width:100%; box-sizing:border-box;
    }
    .doc-card.verified { border-color: rgba(245,158,11,0.45); }
    html:not(.ion-palette-dark) .doc-card.verified { border-color: #f59e0b; }
    .doc-icon {
      width:44px; height:44px; border-radius:10px;
      display:inline-flex; align-items:center; justify-content:center;
      background: rgba(245,158,11,0.16);
      border: 1px solid rgba(245,158,11,0.18);
      color: #f59e0b;
      font-size:20px; flex-shrink:0;
    }
    .doc-icon.school {
      background: rgba(14,165,233,0.14);
      border-color: rgba(14,165,233,0.18);
      color: #38bdf8;
    }
    .doc-text { flex:1; display:flex; flex-direction:column; gap:4px; text-align:right; min-width:0; }
    .doc-text b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .doc-text small { font-size:11px; color:var(--text-secondary); }
    .doc-check { font-size:18px; color: #22c55e; flex-shrink:0; }
    .add-doc-btn {
      width:100%; box-sizing:border-box;
      background: transparent;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 14px;
      font-size:13px; font-weight:700; font-family:inherit;
      color: var(--text-primary);
      cursor:pointer; text-align:center;
    }
    .add-doc-btn:active { transform: scale(0.99); }
  `],
})
export class DocumentsPage implements OnInit {
  private api = inject(ApiService);
  loading = signal(false);
  private remote = signal<DocItem[] | null>(null);
  items = computed(() => this.remote() ?? DEMO);
  constructor() { addIcons({ trophyOutline, schoolOutline, shieldCheckmarkOutline }); }
  ngOnInit() {
    this.loading.set(true);
    this.api.certificates.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Certificate[] : [];
        if (arr.length) {
          this.remote.set(arr.slice(0, 8).map((c, i) => ({
            id: c.id,
            title: c.name,
            issuer: [c.issuer, c.issueDate ? String(c.issueDate).slice(0,4) : ''].filter(Boolean).join(' · ') || '—',
            verified: i === 0,
            kind: (i % 2 === 0 ? 'trophy' : 'school') as DocItem['kind'],
          })));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  onAdd() {}
}

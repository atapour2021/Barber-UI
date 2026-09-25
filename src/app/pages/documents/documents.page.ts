import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner, IonInput, IonItem, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trophyOutline, schoolOutline, shieldCheckmarkOutline, closeOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Certificate } from '../../core/models';
import { fa } from '../../core/i18n/fa';

type DocItem = { id: string; title: string; issuer: string; verified?: boolean; kind: 'trophy' | 'school' };

const DEMO: DocItem[] = [
  { id: '1', title: 'مدرک درجه یک آرایشگری', issuer: 'سازمان فنی و حرفه‌ای · ۱۴۰۲', verified: true, kind: 'trophy' },
  { id: '2', title: 'مسترکلاس فید تخصصی', issuer: 'آکادمی نیوباربر · ۱۴۰۴', kind: 'school' },
];

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule, IonContent, IonIcon, IonSpinner, IonInput, IonItem, IonButton],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap docs-wrap" dir="rtl">
        <div class="docs-head">
          <h1>{{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
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

          @if (showForm()) {
            <div class="dark-card" style="display:grid;gap:10px;padding:14px">
              <ion-item lines="none" class="custom-input"><ion-input [placeholder]="t.certPlaceholder" [(ngModel)]="form.name"></ion-input></ion-item>
              <ion-item lines="none" class="custom-input"><ion-input [placeholder]="t.issuerPlaceholder" [(ngModel)]="form.issuer"></ion-input></ion-item>
              <ion-item lines="none" class="custom-input"><ion-input type="date" [(ngModel)]="form.issueDate"></ion-input></ion-item>
              <ion-item lines="none" class="custom-input"><ion-input type="date" [placeholder]="t.expiryPlaceholder" [(ngModel)]="form.expiryDate"></ion-input></ion-item>
              @if (formError()) { <div class="alert-error" style="text-align:center">{{ formError() }}</div> }
              <div style="display:flex;gap:8px">
                <ion-button style="flex:1;--background:var(--accent);--color:var(--accent-contrast)" (click)="submit()" [disabled]="submitting()">{{ submitting() ? t.submitting : t.submit }}</ion-button>
                <ion-button fill="outline" (click)="showForm.set(false)"><ion-icon name="close-outline" slot="icon-only"></ion-icon></ion-button>
              </div>
            </div>
          } @else {
            <button type="button" class="add-doc-btn" (click)="showForm.set(true)">{{ t.addNew }}</button>
          }
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
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  t = fa.documents;
  c = fa.common;
  loading = signal(false);
  submitting = signal(false);
  showForm = signal(false);
  formError = signal('');
  form: Record<string, string> = { name: '', issuer: '', issueDate: new Date().toISOString().slice(0, 10), expiryDate: '' };
  private remote = signal<DocItem[] | null>(null);
  items = computed(() => this.remote() ?? DEMO);
  constructor() { addIcons({ trophyOutline, schoolOutline, shieldCheckmarkOutline, closeOutline }); }
  ngOnInit() { this.load(); }
  load() {
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
  submit() {
    if (this.submitting()) return;
    this.formError.set('');
    if (!this.form['name']?.trim() || !this.form['issuer']?.trim() || !this.form['issueDate']) {
      this.formError.set(this.t.required);
      return;
    }
    this.submitting.set(true);
    const resolveBarber = (barberId: string) => {
      const payload: Record<string, unknown> = {
        name: this.form['name'].trim(),
        issuer: this.form['issuer'].trim(),
        issueDate: this.form['issueDate'],
        barberId,
      };
      if (this.form['expiryDate']) payload['expiryDate'] = this.form['expiryDate'];
      this.api.certificates.create(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form = { name: '', issuer: '', issueDate: new Date().toISOString().slice(0, 10), expiryDate: '' };
          this.toast.success(this.t.created);
          this.load();
        },
        error: (e) => {
          this.submitting.set(false);
          const msg = (e?.error as { message?: string })?.message ?? fa.errors.generic;
          this.formError.set(msg);
          this.toast.error(msg);
        },
      });
    };
    this.api.barbers.me().subscribe({
      next: (b) => resolveBarber((b as unknown as Record<string, unknown>)['id'] as string),
      error: () => {
        const uid = this.auth.user()?.id;
        if (!uid) { this.submitting.set(false); this.formError.set(this.t.barberNotFound); return; }
        this.api.barbers.list().subscribe({
          next: (v) => {
            const arr = Array.isArray(v) ? v as unknown as Record<string, unknown>[] : [];
            const found = arr.find((x) => x['userId'] === uid) ?? arr[0];
            if (found?.['id']) resolveBarber(found['id'] as string);
            else { this.submitting.set(false); this.formError.set(this.t.barberNotFound); }
          },
          error: () => { this.submitting.set(false); this.formError.set(this.t.findFailed); },
        });
      },
    });
  }
}

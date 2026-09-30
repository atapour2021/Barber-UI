import { Component, inject, signal } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  imagesOutline,
  sparklesOutline,
  refreshOutline,
  closeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  cutOutline,
  timeOutline,
  ribbonOutline,
  eyeOutline,
  imageOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { UiButtonComponent } from '../../shared/ui/ui';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { AiAdvisorResponse } from '../../core/api/ai.api';
import {
  HairstylePreviewService,
  dataUrlToSvgString,
  downloadDataUrlAsSvg,
  downloadSvgString,
} from './hairstyle-preview.service';

@Component({
  selector: 'app-ai-advisor',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, RouterLink, UiButtonComponent, DecimalPipe, JsonPipe],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap ai-wrap" dir="rtl">
        <div class="ai-head">
          <h1><ion-icon name="sparkles-outline"></ion-icon> {{ t.title }}</h1>
          <p>{{ t.subtitle }}</p>
          <p class="privacy">{{ t.privacyNotice }}</p>
        </div>

        <div class="ai-actions">
          <input #fileInput type="file" accept="image/jpeg,image/png,image/webp,image/jpg" hidden (change)="onFilePicked($event)" />
          <input #cameraInput type="file" accept="image/*" capture="environment" hidden (change)="onFilePicked($event)" />
          <app-ui-button size="small" (pressed)="fileInput.click()"><ion-icon name="images-outline" style="margin-inline-end:6px"></ion-icon>{{ t.gallery }}</app-ui-button>
          <app-ui-button size="small" fill="outline" (pressed)="cameraInput.click()"><ion-icon name="camera-outline" style="margin-inline-end:6px"></ion-icon>{{ t.camera }}</app-ui-button>
          @if (previewUrl()) {
            <app-ui-button size="small" fill="clear" (pressed)="clear()"><ion-icon name="close-outline" style="margin-inline-end:6px"></ion-icon>{{ t.change }}</app-ui-button>
          }
        </div>

        @if (displayUrl()) {
          <div class="preview-card">
            <img [src]="displayUrl()!" alt="preview" (error)="onImgError($event)" />
            <span class="preview-badge"><ion-icon name="image-outline"></ion-icon> {{ generatedPreview() ? t.previewResult : t.original }}</span>
            @if (generatedPreview() && displayUrl() !== previewUrl()) {
              <span class="preview-badge gen-badge"><ion-icon name="sparkles-outline"></ion-icon> {{ t.previewResult }}</span>
            }
          </div>
          @if (generatedPreview()) {
            <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap">
              <app-ui-button size="small" [fill]="displayUrl() === previewUrl() ? 'solid' : 'outline'" (pressed)="showOriginal()">{{ t.original }}</app-ui-button>
              <app-ui-button size="small" [fill]="displayUrl() === generatedPreview() ? 'solid' : 'outline'" (pressed)="showGenerated()">{{ t.previewResult }}</app-ui-button>
              <app-ui-button size="small" fill="outline" (pressed)="downloadSvg()">{{ t.downloadSvg }}</app-ui-button>
            </div>
          }
        } @else {
          <div class="empty-preview">
            <ion-icon name="images-outline"></ion-icon>
            <p>{{ t.preview }}</p>
          </div>
        }

        @if (previewUrl() && !result() && !loading()) {
          <app-ui-button (pressed)="analyze()" [disabled]="!file()">{{ t.analyze }}</app-ui-button>
        }

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px">
            <ion-spinner></ion-spinner>
            <p class="muted" style="margin:8px 0 0">{{ t.analyzing }}</p>
            <div class="skeleton-list" style="margin-top:12px">
              <div class="dark-card" style="height:72px"></div>
              <div class="dark-card" style="height:72px"></div>
            </div>
          </div>
        }

        @if (errorMsg()) {
          <div class="alert-error" style="text-align:center">
            <ion-icon name="alert-circle-outline" style="margin-inline-end:6px"></ion-icon>{{ errorMsg() }}
            <div style="margin-top:10px;display:flex;gap:8px;justify-content:center">
              <app-ui-button size="small" (pressed)="analyze()" [disabled]="!file()">{{ t.retry }}</app-ui-button>
              <app-ui-button size="small" fill="outline" (pressed)="clear()">{{ t.change }}</app-ui-button>
            </div>
          </div>
        }

        @if (result(); as r) {
          <div class="analysis-card">
            <h3><ion-icon name="checkmark-circle-outline"></ion-icon> {{ t.faceShape }}: {{ faceShapeFa(r.analysis.faceShape) }} <small>({{ percent(r.analysis.faceShapeConfidence) }} {{ t.confidence }})</small></h3>
            @if (r.analysis.hairCharacteristics) {
              <p class="muted">{{ r.analysis.hairCharacteristics | json }}</p>
            }
          </div>

          <div class="section">
            <div class="section-head"><h3>{{ t.recommendations }}</h3><small class="muted">{{ t.compareHint }}</small></div>
            <div class="rec-grid">
              @for (rec of r.recommendations; track rec.id) {
                <div class="rec-card">
                  <div class="rec-head">
                    <span class="rec-icon"><ion-icon [name]="iconFor(rec)"></ion-icon></span>
                    <span class="rec-text">
                      <b>{{ rec.titleFa || rec.title }}</b>
                      <small>{{ rec.category }} · {{ lengthFa(rec.length) }} · {{ percent(rec.confidence) }}%</small>
                    </span>
                    <span class="rec-maint">{{ rec.maintenance }}</span>
                  </div>
                  <p class="muted" style="margin:8px 0 0">{{ rec.descriptionFa || rec.description }}</p>
                  <div class="rec-reason"><b>{{ t.reason }}:</b> {{ rec.reasonFa || rec.reason }}</div>
                  @if (rec.stylingTipsFa.length || rec.stylingTips.length) {
                    <div class="rec-tips"><b>{{ t.stylingTips }}:</b> {{ (rec.stylingTipsFa.length ? rec.stylingTipsFa : rec.stylingTips).join(' · ') }}</div>
                  }

                  <div class="preview-compare">
                    <div class="preview-col">
                      <span class="preview-label">{{ t.original }}</span>
                      <img class="preview-img" [src]="previewUrl()!" alt="original" (error)="onImgError($event)" (click)="showOriginal()" style="cursor:pointer" />
                    </div>
                    <div class="preview-col">
                      <span class="preview-label"><ion-icon name="eye-outline" style="margin-inline-end:4px"></ion-icon>{{ t.previewResult }}</span>
                      @if (previewLoading()[rec.id]) {
                        <div class="preview-placeholder">
                          <ion-spinner></ion-spinner>
                          <span>{{ t.previewLoading }}</span>
                        </div>
                      } @else if (previewError()[rec.id]) {
                        <div class="preview-placeholder">
                          <ion-icon name="alert-circle-outline" style="font-size:18px"></ion-icon>
                          <span>{{ t.previewFailed }}</span>
                          <app-ui-button size="small" fill="outline" (pressed)="retryPreview(rec)">{{ t.previewRetry }}</app-ui-button>
                        </div>
                      } @else if (previewMap()[rec.id]) {
                        <img class="preview-img selectable" [class.selected]="generatedPreview() === previewMap()[rec.id]" [src]="previewMap()[rec.id]!" alt="preview hairstyle" (error)="onImgError($event)" (click)="selectPreview(rec.id)" style="cursor:pointer" />
                        <app-ui-button size="small" fill="outline" (pressed)="selectPreview(rec.id)">{{ t.previewResult }}</app-ui-button>
                      } @else {
                        <div class="preview-placeholder">
                          <ion-icon name="sparkles-outline"></ion-icon>
                          <span>{{ t.previewLoading }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
                    <a class="pill-link" routerLink="/tabs/booking">{{ t.bookWithStyle }}</a>
                    <a class="pill-link ghost" routerLink="/tabs/services">{{ t.viewServices }}</a>
                    <button type="button" class="pill-link ghost" (click)="downloadPreviewSvg(rec.id)">{{ t.downloadSvg }}</button>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="section">
            <div class="section-head"><h3>{{ t.matchedServices }}</h3></div>
            @if (r.matchedServices.length) {
              <div class="svc-mini-grid">
                @for (s of r.matchedServices; track s.id) {
                  <a class="svc-mini-card" routerLink="/tabs/booking" [queryParams]="{ serviceId: s.id }">
                    <span class="svc-mini-text"><b>{{ s.name }}</b><small><ion-icon name="time-outline"></ion-icon> {{ s.duration }} {{ fa.servicesList.minute }}</small></span>
                    <span class="svc-mini-price">{{ s.price | number }} {{ fa.servicesList.currency }}</span>
                  </a>
                }
              </div>
            } @else {
              <p class="muted" style="text-align:center">{{ t.noMatched }}</p>
            }
          </div>

          <div style="display:flex;gap:8px">
            <app-ui-button size="small" fill="outline" (pressed)="clear()">{{ t.change }}</app-ui-button>
            <app-ui-button size="small" (pressed)="analyze()"><ion-icon name="refresh-outline" style="margin-inline-end:6px"></ion-icon>{{ t.retry }}</app-ui-button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .ai-wrap { gap: 14px; padding-top: 12px; max-width: 720px; }
    .ai-head { text-align:right; }
    .ai-head h1 { margin:0; font-size:20px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:8px; justify-content:flex-end; }
    .ai-head h1 ion-icon { color: var(--accent); }
    .ai-head p { margin:6px 0 0; font-size:12px; color:var(--text-secondary); }
    .privacy { font-size:11px !important; color:var(--text-muted) !important; background: rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.18); border-radius:10px; padding:8px 10px; margin-top:10px !important; }
    .ai-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .ai-actions app-ui-button { flex: 1 1 120px; }
    .preview-card { background: var(--card-bg); border:1px solid var(--card-border); border-radius:12px; overflow:hidden; padding:0; position:relative; }
    .preview-card img { width:100%; max-height:360px; object-fit:contain; display:block; background:#0b101e; }
    .preview-badge { position:absolute; top:10px; right:10px; background: rgba(0,0,0,0.62); color:#fff; font-size:10px; font-weight:700; padding:4px 8px; border-radius:999px; display:inline-flex; align-items:center; gap:4px; }
    .gen-badge { top:auto; bottom:10px; background: rgba(245,158,11,0.9); color:#0b101e; }
    .empty-preview { background: var(--card-bg); border:1px dashed var(--card-border-2); border-radius:12px; padding:28px; text-align:center; color:var(--text-muted); }
    .empty-preview ion-icon { font-size:28px; }
    .empty-preview p { margin:8px 0 0; font-size:12px; }
    .analysis-card { background: var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:14px; }
    .analysis-card h3 { margin:0; font-size:13px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:6px; }
    .analysis-card h3 small { font-size:11px; color:var(--text-secondary); font-weight:600; }
    .analysis-card h3 ion-icon { color: var(--ok-green); }
    .rec-grid { display:flex; flex-direction:column; gap:10px; }
    .rec-card { background: var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:14px; }
    .rec-head { display:flex; align-items:center; gap:10px; }
    .rec-icon { width:38px; height:38px; border-radius:10px; background: rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.18); color:var(--accent); display:inline-flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .rec-text { flex:1; display:flex; flex-direction:column; gap:2px; text-align:right; min-width:0; }
    .rec-text b { font-size:13px; font-weight:800; color:var(--text-primary); }
    .rec-text small { font-size:11px; color:var(--text-secondary); }
    .rec-maint { font-size:10px; font-weight:700; padding:4px 8px; border-radius:999px; background: var(--ion-color-step-50); border:1px solid var(--ion-color-step-150); color:var(--text-secondary); flex-shrink:0; }
    .rec-reason, .rec-tips { margin-top:8px; font-size:11px; color:var(--text-secondary); line-height:1.6; text-align:right; }
    .rec-reason b, .rec-tips b { color:var(--text-primary); }
    .preview-compare { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; background: var(--ion-color-step-50); border:1px solid var(--ion-color-step-150); border-radius:10px; padding:10px; }
    @media(max-width:560px){ .preview-compare{ grid-template-columns:1fr; } }
    .preview-col { display:flex; flex-direction:column; gap:6px; }
    .preview-label { font-size:10px; font-weight:700; color:var(--text-secondary); text-align:center; display:inline-flex; align-items:center; justify-content:center; gap:4px; }
    .preview-img { width:100%; aspect-ratio: 3 / 4; object-fit:cover; border-radius:10px; background:#0b101e; border:1px solid var(--card-border); display:block; }
    .preview-img.selectable.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(245,158,11,0.3); }
    .preview-placeholder { width:100%; aspect-ratio: 3 / 4; border-radius:10px; background: var(--card-bg-2); border:1px dashed var(--card-border-2); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:8px; color:var(--text-muted); font-size:11px; text-align:center; padding:10px; min-height:160px; }
    .pill-link { display:inline-flex; align-items:center; gap:6px; background: var(--accent); color: var(--accent-contrast); border-radius:10px; padding:8px 12px; font-size:12px; font-weight:700; text-decoration:none; }
    .pill-link.ghost { background: transparent; border:1px solid var(--card-border-2); color:var(--text-primary); }
    .svc-mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    @media(max-width:560px){ .svc-mini-grid{ grid-template-columns:1fr; } }
    .svc-mini-card { background: var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:space-between; gap:10px; text-decoration:none; }
    .svc-mini-text { display:flex; flex-direction:column; gap:4px; text-align:right; min-width:0; }
    .svc-mini-text b { font-size:12px; font-weight:800; color:var(--text-primary); }
    .svc-mini-text small { font-size:11px; color:var(--text-secondary); display:inline-flex; align-items:center; gap:4px; }
    .svc-mini-price { font-size:11px; font-weight:800; color:var(--text-primary); direction:ltr; white-space:nowrap; }
  `],
})
export class AiAdvisorPage {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private previewSvc = inject(HairstylePreviewService);
  fa = fa;
  t = fa.aiAdvisor;
  file = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  generatedPreview = signal<string | null>(null);
  displayUrl = signal<string | null>(null);
  loading = signal(false);
  errorMsg = signal('');
  result = signal<AiAdvisorResponse | null>(null);
  previewMap = signal<Record<string, string>>({});
  previewLoading = signal<Record<string, boolean>>({});
  previewError = signal<Record<string, string>>({});

  constructor() {
    addIcons({ cameraOutline, imagesOutline, sparklesOutline, refreshOutline, closeOutline, checkmarkCircleOutline, alertCircleOutline, cutOutline, timeOutline, ribbonOutline, eyeOutline, imageOutline });
  }

  onFilePicked(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    input.value = '';
    if (!f) return;
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!f.type.startsWith('image/') || (!okTypes.includes(f.type) && !f.type.startsWith('image/'))) {
      this.errorMsg.set(this.t.errorInvalidType);
      this.toast.warning(this.t.errorInvalidType);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      this.errorMsg.set(this.t.errorTooLarge);
      this.toast.warning(this.t.errorTooLarge);
      return;
    }
    this.errorMsg.set('');
    this.result.set(null);
    this.resetPreviews();
    this.file.set(f);
    const url = URL.createObjectURL(f);
    const prev = this.previewUrl();
    if (prev) URL.revokeObjectURL(prev);
    const gen = this.generatedPreview();
    if (gen && gen.startsWith('blob:')) URL.revokeObjectURL(gen);
    this.previewUrl.set(url);
    this.generatedPreview.set(null);
    this.displayUrl.set(url);
  }

  clear() {
    const prev = this.previewUrl();
    if (prev) URL.revokeObjectURL(prev);
    const gen = this.generatedPreview();
    if (gen && gen.startsWith('blob:')) URL.revokeObjectURL(gen);
    this.previewUrl.set(null);
    this.generatedPreview.set(null);
    this.displayUrl.set(null);
    this.file.set(null);
    this.errorMsg.set('');
    this.result.set(null);
    this.resetPreviews();
  }

  private resetPreviews() {
    this.previewMap.set({});
    this.previewLoading.set({});
    this.previewError.set({});
  }

  analyze() {
    const f = this.file();
    if (!f) {
      this.errorMsg.set(this.t.errorImageRequired);
      this.toast.warning(this.t.errorImageRequired);
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    this.result.set(null);
    this.resetPreviews();
    this.generatedPreview.set(null);
    this.displayUrl.set(this.previewUrl());
    const fd = new FormData();
    fd.append('image', f, f.name);
    this.api.ai.recommend(fd).subscribe({
      next: (v) => {
        this.result.set(v as AiAdvisorResponse);
        this.loading.set(false);
        this.buildPreviews();
      },
      error: (err) => {
        const status = (err as { status?: number })?.status;
        if (status === 401) this.errorMsg.set(this.t.errorNotLoggedIn);
        else this.errorMsg.set(extractMessage(err, this.t.errorFailed));
        this.loading.set(false);
      },
    });
  }

  private buildPreviews() {
    const recs = this.result()?.recommendations ?? [];
    const src = this.file();
    if (!recs.length || !src) return;
    for (const rec of recs) this.runPreview(rec, src);
  }

  private async runPreview(rec: { id: string; category?: string; length?: string; title?: string; titleFa?: string }, src: File) {
    const id = rec.id;
    const isFirst = !this.generatedPreview();
    this.previewLoading.update((m) => ({ ...m, [id]: true }));
    this.previewError.update((m) => {
      const n = { ...m };
      delete n[id];
      return n;
    });
    try {
      const url = await this.previewSvc.render(src, rec);
      const normalized = this.normalizePreviewUrl(url);
      this.previewMap.update((m) => ({ ...m, [id]: normalized }));
      if (isFirst) {
        this.generatedPreview.set(normalized);
        this.displayUrl.set(normalized);
        try {
          downloadDataUrlAsSvg(normalized, `ai-hairstyle-${id}.svg`);
          this.toast.success(this.t.downloadSuccess);
        } catch {}
      }
    } catch {
      this.previewError.update((m) => ({ ...m, [id]: this.t.previewFailed }));
    } finally {
      this.previewLoading.update((m) => ({ ...m, [id]: false }));
    }
  }

  private normalizePreviewUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    if (/^[A-Za-z0-9+/=\n\r]+$/.test(url.slice(0, 80)) && url.length > 80) return `data:image/png;base64,${url.replace(/\s/g, '')}`;
    return url;
  }

  selectPreview(id: string) {
    const url = this.previewMap()[id];
    if (url) {
      this.generatedPreview.set(url);
      this.displayUrl.set(url);
    }
  }

  showOriginal() {
    this.displayUrl.set(this.previewUrl());
  }

  showGenerated() {
    const g = this.generatedPreview();
    if (g) this.displayUrl.set(g);
  }

  retryPreview(rec: { id: string; category?: string; length?: string; title?: string; titleFa?: string }) {
    const src = this.file();
    if (!src) return;
    this.previewMap.update((m) => {
      const n = { ...m };
      delete n[rec.id];
      return n;
    });
    this.runPreview(rec, src);
  }

  downloadSvg() {
    const g = this.generatedPreview() || this.displayUrl();
    if (!g) return;
    try {
      downloadDataUrlAsSvg(g, 'ai-hairstyle.svg');
      this.toast.success(this.t.downloadSuccess);
    } catch {
      this.toast.warning(this.t.previewFailed);
    }
  }

  downloadPreviewSvg(id: string) {
    const url = this.previewMap()[id] || this.generatedPreview();
    if (!url) return;
    try {
      downloadDataUrlAsSvg(url, `ai-hairstyle-${id}.svg`);
      this.toast.success(this.t.downloadSuccess);
    } catch {
      this.toast.warning(this.t.previewFailed);
    }
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/300?u=fallback';
  }

  faceShapeFa(s: string): string {
    const m: Record<string, string> = { oval: 'بیضی', round: 'گرد', square: 'مربعی', heart: 'قلبی', oblong: 'کشیده', diamond: 'لوزی', unknown: 'نامشخص' };
    return m[String(s).toLowerCase()] ?? s;
  }

  lengthFa(s: string): string {
    const m: Record<string, string> = { short: 'کوتاه', medium: 'متوسط', long: 'بلند' };
    return m[String(s).toLowerCase()] ?? s;
  }

  percent(n: number): string {
    const v = typeof n === 'number' ? n : Number(n) || 0;
    const p = v <= 1 ? Math.round(v * 100) : Math.round(v);
    try { return new Intl.NumberFormat('fa-IR').format(p); } catch { return String(p); }
  }

  iconFor(r: { category?: string; tags?: string[] }): string {
    const k = `${r.category ?? ''} ${(r.tags ?? []).join(' ')}`.toLowerCase();
    if (k.includes('fade') || k.includes('buzz')) return 'cut-outline';
    if (k.includes('curly') || k.includes('wave')) return 'sparkles-outline';
    return 'ribbon-outline';
  }
}

import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface PreviewRec {
  id: string;
  category?: string;
  length?: string;
  title?: string;
  titleFa?: string;
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function dataUrlToSvgString(dataUrl: string): string {
  if (!dataUrl) return '';
  if (dataUrl.startsWith('data:image/svg+xml')) {
    const comma = dataUrl.indexOf(',');
    const payload = dataUrl.slice(comma + 1);
    const isB64 = dataUrl.slice(0, comma).includes('base64');
    try {
      return isB64 ? atob(payload) : decodeURIComponent(payload);
    } catch {
      return payload;
    }
  }
  const esc = dataUrl.replace(/"/g, '&quot;');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="800" viewBox="0 0 600 800"><image href="${esc}" xlink:href="${esc}" x="0" y="0" width="600" height="800" preserveAspectRatio="xMidYMid meet"/></svg>`;
}

export function downloadSvgString(svg: string, filename: string) {
  const name = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

export function downloadDataUrlAsSvg(dataUrl: string, filename: string) {
  if (!dataUrl) return;
  downloadSvgString(dataUrlToSvgString(dataUrl), filename);
}

@Injectable({ providedIn: 'root' })
export class HairstylePreviewService {
  private api = inject(ApiService);

  async render(source: File | Blob, rec: PreviewRec): Promise<string> {
    const fd = new FormData();
    fd.append('image', source, (source as File).name || 'input.jpg');
    fd.append('recommendationId', rec.id);
    if (rec.title) fd.append('title', rec.title);
    if (rec.titleFa) fd.append('titleFa', rec.titleFa);
    if (rec.category) fd.append('category', rec.category);
    if (rec.length) fd.append('length', rec.length);
    const res = (await firstValueFrom(this.api.ai.preview(fd))) as {
      previewImage?: string | null;
      url?: string;
      note?: string;
      mime?: string;
    };
    const img = res?.previewImage;
    if (typeof img === 'string' && img.length > 10) {
      if (img.startsWith('data:')) return img;
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (/^[A-Za-z0-9+/=]+$/.test(img.slice(0, 80)) && img.length > 100) {
        const mime = res?.mime || 'image/png';
        return `data:${mime};base64,${img}`;
      }
      return img;
    }
    if (res?.url && typeof res.url === 'string') return res.url;
    throw new Error(res?.note || 'preview unavailable');
  }
}

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

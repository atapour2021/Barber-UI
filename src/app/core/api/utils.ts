import { HttpParams } from '@angular/common/http';

export function toParams(p?: Record<string, unknown>): HttpParams {
  let hp = new HttpParams();
  if (!p) return hp;
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v));
  }
  return hp;
}

export function unwrapArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  const o = v as Record<string, unknown> | null;
  if (o && Array.isArray(o['data'])) return o['data'] as T[];
  if (o && Array.isArray(o['items'])) return o['items'] as T[];
  return [];
}

export function unwrapPaginated<T>(v: unknown): {
  data: T[];
  total: number;
  page: number;
  limit: number;
} {
  if (Array.isArray(v)) return { data: v as T[], total: (v as T[]).length, page: 1, limit: (v as T[]).length };
  const o = v as Record<string, unknown>;
  const data = (o['data'] as T[]) ?? (o['items'] as T[]) ?? [];
  const meta = (o['meta'] as Record<string, unknown>) ?? o;
  return {
    data: Array.isArray(data) ? data : [],
    total: (meta['total'] as number) ?? data.length,
    page: (meta['page'] as number) ?? 1,
    limit: (meta['limit'] as number) ?? data.length,
  };
}

export type UploadResult = {
  filename: string;
  originalName: string;
  size: number;
  path: string;
  url?: string;
  file?: string;
};

export function normalizeUpload(r: unknown): UploadResult {
  const o = r as Record<string, unknown>;
  return {
    filename: (o['filename'] as string) ?? '',
    originalName: (o['originalName'] as string) ?? '',
    size: (o['size'] as number) ?? 0,
    path: (o['path'] as string) ?? '',
    url: (o['url'] as string) ?? (o['path'] as string) ?? '',
    file: (o['file'] as string) ?? (o['filename'] as string) ?? '',
  };
}

import { fa } from '../i18n/fa';

export function extractMessage(err: unknown, fallback: string = fa.errors.generic): string {
  const e = err as Record<string, unknown>;
  const data = (e?.['error'] as Record<string, unknown>) ?? {};
  const msg =
    (data['message'] as string) ??
    (data['msg'] as string) ??
    (e?.['message'] as string) ??
    '';
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (Array.isArray(data['message'])) return (data['message'] as string[]).join('، ');
  const status = e?.['status'] as number | undefined;
  if (status === 0) return fa.errors.network;
  if (status === 404) return fa.errors.notFound;
  if (status === 401) return fa.errors.unauthorized;
  if (status !== undefined && status >= 500) return fa.errors.server;
  return fallback;
}

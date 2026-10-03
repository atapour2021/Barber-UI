export const TEHRAN_TZ = 'Asia/Tehran';
export const TEHRAN_OFFSET = '+03:30';

export function tehranYMD(d: Date | string = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TEHRAN_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
}
export function todayTehranYMD(): string { return tehranYMD(new Date()); }
export function tehranTime(d: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TEHRAN_TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(d));
}
export function jalaliFa(d: Date | string): string {
  try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: TEHRAN_TZ, year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d)); } catch { return tehranYMD(d); }
}
export function jalaliFaShort(d: Date | string): string {
  try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: TEHRAN_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d)); } catch { return tehranYMD(d); }
}
export function jalaliFaWithWeekday(d: Date | string): string {
  try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: TEHRAN_TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d)); } catch { return jalaliFa(d); }
}
export function jalaliFaWithTime(d: Date | string): string {
  try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: TEHRAN_TZ, year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(d)); } catch { return `${jalaliFa(d)} ${tehranTime(d)}`; }
}
export function jalaliParts(date: Date): { jy: number; jm: number; jd: number } {
  const p = new Intl.DateTimeFormat('en-u-ca-persian', { timeZone: TEHRAN_TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date);
  const m: Record<string, string> = {}; for (const x of p) m[x.type] = x.value;
  return { jy: Number(m['year']), jm: Number(m['month']), jd: Number(m['day']) };
}
export function jalaliPartsFromYMD(ymd: string): { jy: number; jm: number; jd: number } {
  return jalaliParts(new Date(`${ymd}T12:00:00${TEHRAN_OFFSET}`));
}
export function jalaliMonthName(jm: number): string {
  return ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][jm - 1] ?? String(jm);
}
export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const isLeap = ((jy * 682) % 2816) < 682;
  return isLeap ? 30 : 29;
}
export function toPersianDigits(s: string): string {
  return s.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] ?? d);
}
export function jalaliYMDToGregorianYMD(jy: number, jm: number, jd: number): string {
  const g = jalaliToGregorian(jy, jm, jd);
  return tehranYMD(g);
}
export function gregorianYMDToJalaliDisplay(ymd: string): string {
  if (!ymd) return '';
  try { return jalaliFa(new Date(`${ymd}T12:00:00${TEHRAN_OFFSET}`)); } catch { return ymd; }
}
export function jalaliYMDToDisplay(jy: number, jm: number, jd: number): string {
  return toPersianDigits(`${jy}/${String(jm).padStart(2,'0')}/${String(jd).padStart(2,'0')}`);
}
function div(a: number, b: number): number { return Math.floor(a / b); }
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  let gy: number;
  if (jy <= 979) { gy = 621; jy += 990; } else { gy = 1600; jy -= 979; }
  let days = 365 * jy + div(jy, 33) * 8 + div((jy % 33 + 3), 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) { gy += 100 * div(--days, 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) { gy += div(days - 1, 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0; for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return new Date(Date.UTC(gy, gm - 1, gd, 8, 30, 0));
}
export function tehranSlotUtc(dateYMD: string, hhmm: string): string {
  return new Date(`${dateYMD}T${hhmm}:00${TEHRAN_OFFSET}`).toISOString();
}

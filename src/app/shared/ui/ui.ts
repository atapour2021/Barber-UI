import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonSpinner, IonTextarea } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

export interface UiOption {
  value: string;
  label: string;
}

const FIELD_STYLE = `
  :host{ display:block; width:100%; }
  .ui-field{ display:flex; flex-direction:column; gap:6px; width:100%; }
  .ui-label{ font-size:12px; font-weight:600; color:var(--text-secondary); padding-inline:2px; text-align:right; }
  .ui-control{
    display:flex; align-items:center; gap:8px;
    background:var(--ion-color-step-50);
    border:1px solid var(--ion-color-step-150);
    border-radius:12px;
    padding:0 12px;
    min-height:48px;
    transition:border-color .18s, box-shadow .18s, background .18s;
    box-sizing:border-box;
  }
  .ui-control:focus-within{
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(245,158,11,.14);
    background:var(--card-bg);
  }
  .ui-control--disabled{ opacity:.55; pointer-events:none; }
  .ui-control--textarea{ align-items:flex-start; padding:10px 12px; min-height:92px; }
  .ui-icon{ font-size:18px; color:var(--text-muted); flex-shrink:0; }
  .eye-btn{ --padding-start:6px; --padding-end:6px; --color:var(--text-muted); --background:transparent; --box-shadow:none; margin:0; }
  ion-input, ion-textarea, ion-select{ flex:1; --color:var(--text-primary); --placeholder-color:var(--text-muted); --placeholder-opacity:1; font-size:14px; width:100%; }
  .ltr ion-input{ direction:ltr; text-align:left; }
  :host-context(html:not(.ion-palette-dark)) .ui-control{ background:#fff; }
  :host-context(html:not(.ion-palette-dark)) .ui-control:focus-within{ background:#fff; box-shadow:0 0 0 3px rgba(245,158,11,.12); }
`;

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [FormsModule, IonInput, IonButton, IonIcon],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInputComponent), multi: true }],
  styles: [FIELD_STYLE],
  template: `<div class="ui-field" [class.ltr]="ltr">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control" [class.ui-control--disabled]="disabled">
      @if (icon) { <ion-icon [name]="icon" class="ui-icon"></ion-icon> }
      <ion-input
        [type]="actualType"
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        [autocomplete]="autocomplete"
        [inputmode]="inputmode"
        [maxlength]="maxlength"
        (ionInput)="onInput($event)"
        (ionBlur)="touch()"
      />
      @if (togglePassword) {
        <ion-button fill="clear" size="small" class="eye-btn" (click)="show = !show" type="button">
          <ion-icon [name]="show ? 'eye-off-outline' : 'eye-outline'" slot="icon-only"></ion-icon>
        </ion-button>
      }
    </div>
  </div>`,
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() icon = '';
  @Input() autocomplete = '';
  @Input() inputmode = '';
  @Input() maxlength: number | undefined;
  @Input() togglePassword = false;
  @Input() ltr = false;
  val: string | number | null | undefined = '';
  disabled = false;
  show = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  constructor() { addIcons({ eyeOutline, eyeOffOutline }); }
  get actualType() { return this.togglePassword ? (this.show ? 'text' : 'password') : this.type; }
  onInput(e: CustomEvent) { this.val = (e.detail as { value?: string }).value ?? ''; this.change(this.val); }
  touch() { this.touched(); }
  writeValue(v: unknown): void { this.val = (v as string) ?? ''; }
  registerOnChange(fn: (v: unknown) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}

@Component({
  selector: 'app-ui-textarea',
  standalone: true,
  imports: [FormsModule, IonTextarea],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiTextareaComponent), multi: true }],
  styles: [FIELD_STYLE],
  template: `<div class="ui-field">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control ui-control--textarea" [class.ui-control--disabled]="disabled">
      <ion-textarea
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        [autoGrow]="true"
        [rows]="rows"
        (ionInput)="onInput($event)"
        (ionBlur)="touch()"
      />
    </div>
  </div>`,
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 3;
  val: string | null | undefined = '';
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onInput(e: CustomEvent) { this.val = (e.detail as { value?: string }).value ?? ''; this.change(this.val); }
  touch() { this.touched(); }
  writeValue(v: unknown): void { this.val = (v as string) ?? ''; }
  registerOnChange(fn: (v: unknown) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}

@Component({
  selector: 'app-ui-select',
  standalone: true,
  imports: [FormsModule, IonSelect, IonSelectOption],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true }],
  styles: [FIELD_STYLE],
  template: `<div class="ui-field">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control" [class.ui-control--disabled]="disabled">
      <ion-select
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        [interface]="iface"
        (ionChange)="onChange($event)"
        (ionBlur)="touch()"
      >
        @for (o of options; track o.value) { <ion-select-option [value]="o.value">{{ o.label }}</ion-select-option> }
      </ion-select>
    </div>
  </div>`,
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: UiOption[] = [];
  @Input() iface: 'popover' | 'alert' | 'action-sheet' = 'popover';
  val: string | null | undefined = '';
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onChange(e: CustomEvent) { this.val = (e.detail as { value?: string }).value ?? ''; this.change(this.val); }
  touch() { this.touched(); }
  writeValue(v: unknown): void { this.val = (v as string) ?? ''; }
  registerOnChange(fn: (v: unknown) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}

@Component({
  selector: 'app-ui-datepicker',
  standalone: true,
  imports: [FormsModule, IonIcon],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiDatepickerComponent), multi: true }],
  styles: [FIELD_STYLE + `
    .dp-trigger{ flex:1; display:flex; align-items:center; justify-content:space-between; gap:8px; cursor:pointer; min-height:32px; }
    .dp-display{ flex:1; font-size:14px; color:var(--text-primary); text-align:right; }
    .dp-display--empty{ color:var(--text-muted); }
    .dp-cal{ position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px; }
    .dp-backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.42); }
    .dp-panel{ position:relative; background:var(--card-bg); border:1px solid var(--card-border); border-radius:16px; width:min(360px,100%); padding:14px; box-shadow:var(--shadow-card); max-height:90vh; overflow:auto; }
    .dp-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
    .dp-nav{ width:32px; height:32px; border-radius:8px; border:1px solid var(--card-border); background:transparent; color:var(--text-primary); cursor:pointer; font-size:16px; display:inline-flex; align-items:center; justify-content:center; }
    .dp-title{ font-size:13px; font-weight:800; color:var(--text-primary); text-align:center; flex:1; }
    .dp-week{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:6px; }
    .dp-week span{ font-size:11px; font-weight:700; color:var(--text-muted); text-align:center; padding:4px 0; }
    .dp-grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
    .dp-day{ height:36px; border-radius:8px; border:1px solid transparent; background:transparent; color:var(--text-primary); font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; }
    .dp-day:disabled{ opacity:.32; cursor:default; }
    .dp-day--today{ border-color:var(--accent); color:var(--accent); }
    .dp-day--sel{ background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .dp-foot{ display:flex; gap:8px; margin-top:12px; }
    .dp-foot button{ flex:1; min-height:38px; border-radius:10px; border:none; font-family:inherit; font-size:12px; font-weight:800; cursor:pointer; }
    .dp-foot .ok{ background:var(--accent); color:var(--accent-contrast); }
    .dp-foot .ghost{ background:transparent; border:1px solid var(--card-border); color:var(--text-primary); }
  `],
  template: `<div class="ui-field">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control" [class.ui-control--disabled]="disabled" (click)="openPicker()" style="cursor:pointer">
      <span class="dp-trigger" role="button" tabindex="0" (keydown.enter)="openPicker()" (keydown.space)="$event.preventDefault(); openPicker()">
        <span class="dp-display" [class.dp-display--empty]="!val">{{ display || placeholder || 'انتخاب تاریخ' }}</span>
        <ion-icon name="calendar-outline" style="font-size:18px;color:var(--text-muted);flex-shrink:0"></ion-icon>
      </span>
    </div>
    @if (open) {
      <div class="dp-cal" (click)="close()">
        <div class="dp-backdrop"></div>
        <div class="dp-panel" (click)="$event.stopPropagation()">
          <div class="dp-head">
            <button type="button" class="dp-nav" (click)="prevMonth()">‹</button>
            <span class="dp-title">{{ jalaliMonthName(jm) }} {{ toFa(jy) }}</span>
            <button type="button" class="dp-nav" (click)="nextMonth()">›</button>
          </div>
          <div class="dp-week">@for (w of weekNames; track w) { <span>{{ w }}</span> }</div>
          <div class="dp-grid">
            @for (c of cells; track $index) {
              @if (c === null) { <span></span> }
              @else {
                <button type="button" class="dp-day" [class.dp-day--sel]="isSelected(c)" [class.dp-day--today]="isToday(c)" [disabled]="isDisabled(c)" (click)="pickDay(c)">{{ toFa(c) }}</button>
              }
            }
          </div>
          <div class="dp-foot">
            <button type="button" class="ghost" (click)="close()">انصراف</button>
            <button type="button" class="ghost" (click)="today()">امروز</button>
            <button type="button" class="ok" (click)="confirm()">تایید</button>
          </div>
        </div>
      </div>
    }
  </div>`,
})
export class UiDatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() min?: string;
  @Input() max?: string;
  val = '';
  get display(): string {
    if (!this.val) return '';
    try {
      const jp = this.jalaliPartsFromYMD(this.val);
      return `${this.toFa(jp.jy)}/${this.toFa(String(jp.jm).padStart(2,'0'))}/${this.toFa(String(jp.jd).padStart(2,'0'))} · ${this.jalaliMonthName(jp.jm)}`;
    } catch { return this.val; }
  }
  disabled = false;
  open = false;
  jy = 1404; jm = 1; jd = 1;
  private selJy = 0; private selJm = 0; private selJd = 0;
  weekNames = ['ش','ی','د','س','چ','پ','ج'];
  cells: (number|null)[] = [];
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  constructor() { const now = this.jalaliParts(new Date()); this.jy = now.jy; this.jm = now.jm; this.jd = now.jd; this.rebuild(); }
  openPicker() { if (this.disabled) return; if (this.val) { const p = this.jalaliPartsFromYMD(this.val); this.jy = p.jy; this.jm = p.jm; this.selJy = p.jy; this.selJm = p.jm; this.selJd = p.jd; } else { const n = this.jalaliParts(new Date()); this.jy = n.jy; this.jm = n.jm; this.selJy = n.jy; this.selJm = n.jm; this.selJd = n.jd; } this.rebuild(); this.open = true; }
  close() { this.open = false; this.touched(); }
  prevMonth() { this.jm--; if (this.jm < 1) { this.jm = 12; this.jy--; } this.rebuild(); }
  nextMonth() { this.jm++; if (this.jm > 12) { this.jm = 1; this.jy++; } this.rebuild(); }
  today() { const n = this.jalaliParts(new Date()); this.jy = n.jy; this.jm = n.jm; this.selJy = n.jy; this.selJm = n.jm; this.selJd = n.jd; this.rebuild(); const g = this.jalaliToGregorianYMD(this.selJy, this.selJm, this.selJd); this.val = g; this.change(this.val); this.close(); }
  pickDay(d: number) { this.selJy = this.jy; this.selJm = this.jm; this.selJd = d; this.rebuild(); }
  confirm() { if (!this.selJd) { this.selJy = this.jy; this.selJm = this.jm; this.selJd = 1; } const g = this.jalaliToGregorianYMD(this.selJy, this.selJm, this.selJd); this.val = g; this.change(this.val); this.close(); }
  isSelected(c: number) { return c !== null && this.selJy === this.jy && this.selJm === this.jm && this.selJd === c; }
  isToday(c: number) { const t = this.jalaliParts(new Date()); return this.jy === t.jy && this.jm === t.jm && c === t.jd; }
  isDisabled(c: number) { const g = this.jalaliToGregorianYMD(this.jy, this.jm, c); if (this.min && g < this.min.slice(0,10)) return true; if (this.max && g > this.max.slice(0,10)) return true; return false; }
  toFa(v: number|string) { return String(v).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] ?? d); }
  jalaliMonthName(jm: number) { return ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][jm-1] ?? String(jm); }
  rebuild() {
    const len = this.jalaliMonthLength(this.jy, this.jm);
    const firstG = this.jalaliToGregorian(this.jy, this.jm, 1);
    const w = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tehran', weekday: 'short' }).format(firstG);
    const map: Record<string,number> = { Sat:0, Sun:1, Mon:2, Tue:3, Wed:4, Thu:5, Fri:6 };
    const off = map[w] ?? 0;
    const cells: (number|null)[] = [];
    for (let i=0;i<off;i++) cells.push(null);
    for (let d=1; d<=len; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    while (cells.length < 35) cells.push(null);
    this.cells = cells;
  }
  jalaliParts(date: Date) { const p = new Intl.DateTimeFormat('en-u-ca-persian', { timeZone: 'Asia/Tehran', year:'numeric', month:'numeric', day:'numeric' }).formatToParts(date); const m: Record<string,string> = {}; for (const x of p) m[x.type]=x.value; return { jy:Number(m['year']), jm:Number(m['month']), jd:Number(m['day']) }; }
  jalaliPartsFromYMD(ymd: string) { return this.jalaliParts(new Date(`${ymd}T12:00:00+03:30`)); }
  jalaliMonthLength(jy:number,jm:number){ if(jm<=6) return 31; if(jm<=11) return 30; return ((jy*682)%2816)<682 ? 30:29; }
  jalaliToGregorian(jy:number,jm:number,jd:number): Date {
    let gy:number; if(jy<=979){ gy=621; jy+=990; } else { gy=1600; jy-=979; }
    const div=(a:number,b:number)=>Math.floor(a/b);
    let days=365*jy+div(jy,33)*8+div((jy%33+3),4)+78+jd+(jm<7?(jm-1)*31:(jm-7)*30+186);
    gy+=400*div(days,146097); days%=146097;
    if(days>36524){ gy+=100*div(--days,36524); days%=36524; if(days>=365) days++; }
    gy+=4*div(days,1461); days%=1461;
    if(days>365){ gy+=div(days-1,365); days=(days-1)%365; }
    let gd=days+1; const sal_a=[0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
    let gm=0; for(gm=0; gm<13 && gd>sal_a[gm]; gm++) gd-=sal_a[gm];
    return new Date(Date.UTC(gy, gm-1, gd, 8,30,0));
  }
  jalaliToGregorianYMD(jy:number,jm:number,jd:number): string { const d=this.jalaliToGregorian(jy,jm,jd); return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Tehran', year:'numeric', month:'2-digit', day:'2-digit'}).format(d); }
  writeValue(v: unknown): void { this.val = typeof v === 'string' ? v.slice(0,10) : ''; if (this.val) { const p=this.jalaliPartsFromYMD(this.val); this.selJy=p.jy; this.selJm=p.jm; this.selJd=p.jd; } }
  registerOnChange(fn: (v: unknown) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}

@Component({
  selector: 'app-ui-multi-select',
  standalone: true,
  imports: [FormsModule, IonSelect, IonSelectOption],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiMultiSelectComponent), multi: true }],
  styles: [FIELD_STYLE],
  template: `<div class="ui-field">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control" [class.ui-control--disabled]="disabled">
      <ion-select
        [multiple]="true"
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        [interface]="iface"
        (ionChange)="onChange($event)"
        (ionBlur)="touch()"
      >
        @for (o of options; track o.value) { <ion-select-option [value]="o.value">{{ o.label }}</ion-select-option> }
      </ion-select>
    </div>
  </div>`,
})
export class UiMultiSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: UiOption[] = [];
  @Input() iface: 'popover' | 'alert' | 'action-sheet' = 'popover';
  val: string[] = [];
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onChange(e: CustomEvent) { this.val = ((e.detail as { value?: string[] }).value ?? []) as string[]; this.change(this.val); }
  touch() { this.touched(); }
  writeValue(v: unknown): void { this.val = Array.isArray(v) ? (v as string[]) : []; }
  registerOnChange(fn: (v: unknown) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}

@Component({
  selector: 'app-ui-number',
  standalone: true,
  imports: [FormsModule, IonInput],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiNumberComponent), multi: true }],
  styles: [FIELD_STYLE],
  template: `<div class="ui-field">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control" [class.ui-control--disabled]="disabled">
      <ion-input type="number" [placeholder]="placeholder" [value]="val" [disabled]="disabled" (ionInput)="onInput($event)" (ionBlur)="touch()" />
    </div>
  </div>`,
})
export class UiNumberComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  val: number | null | undefined = null;
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onInput(e: CustomEvent) {
    const raw = (e.detail as { value?: string }).value;
    this.val = raw === '' || raw === undefined ? null : Number(raw);
    this.change(this.val);
  }
  touch() { this.touched(); }
  writeValue(v: unknown): void { this.val = (v as number) ?? null; }
  registerOnChange(fn: (v: unknown) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [IonButton, IonSpinner, IonIcon],
  styles: [`
    :host{ display:block; width:100%; }
    ion-button{
      --border-radius:12px;
      --box-shadow:none;
      font-weight:700;
      text-transform:none;
      letter-spacing:0;
      font-family:inherit;
      margin:0;
      width:100%;
    }
    ion-button[size="small"]{ height:36px; font-size:12px; --padding-start:14px; --padding-end:14px; }
    ion-button[size="default"]{ height:44px; font-size:13px; --padding-start:16px; --padding-end:16px; }
    ion-button[size="large"]{ height:52px; font-size:15px; --padding-start:20px; --padding-end:20px; }
    ion-button[fill="solid"]{ --background:var(--accent); --color:var(--accent-contrast); --background-activated:var(--accent-strong); --background-hover:var(--ion-color-primary-tint); }
    ion-button[fill="outline"]{ --border-width:1.2px; --border-color:var(--card-border-2); --color:var(--text-primary); --background:transparent; }
    ion-button[fill="clear"]{ --color:var(--text-secondary); --background:transparent; }
    ion-spinner{ width:18px; height:18px; --color:currentColor; }
  `],
  template: `<ion-button
    [expand]="expand"
    [fill]="fill"
    [color]="color"
    [size]="size"
    [disabled]="disabled || loading"
    (click)="pressed.emit($event)"
    [class]="className"
  >
    @if (loading) { <ion-spinner name="crescent"></ion-spinner> }
    @else {
      @if (icon) { <ion-icon [name]="icon" slot="start"></ion-icon> }
      <ng-content />
    }
  </ion-button>`,
})
export class UiButtonComponent {
  @Input() expand: 'block' | 'full' | undefined = 'block';
  @Input() fill: 'clear' | 'outline' | 'solid' | 'default' = 'solid';
  @Input() color = 'primary';
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon = '';
  @Input() className = '';
  @Output() pressed = new EventEmitter<Event>();
}

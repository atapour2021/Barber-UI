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
  imports: [FormsModule, IonInput],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiDatepickerComponent), multi: true }],
  styles: [FIELD_STYLE],
  template: `<div class="ui-field">
    @if (label) { <label class="ui-label">{{ label }}</label> }
    <div class="ui-control" [class.ui-control--disabled]="disabled">
      <ion-input type="date" [placeholder]="placeholder" [value]="val" [disabled]="disabled" (ionInput)="onInput($event)" (ionBlur)="touch()" />
    </div>
  </div>`,
})
export class UiDatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  val = '';
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onInput(e: CustomEvent) { this.val = (e.detail as { value?: string }).value ?? ''; this.change(this.val); }
  touch() { this.touched(); }
  writeValue(v: unknown): void { this.val = typeof v === 'string' ? v : ''; }
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

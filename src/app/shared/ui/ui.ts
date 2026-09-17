import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

export interface UiOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [FormsModule, IonItem, IonInput, IonButton, IonIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  template: ` <div class="ui-field">
    @if (label) {
      <label>{{ label }}</label>
    }
    <ion-item lines="none">
      @if (icon) {
        <ion-icon [name]="icon" slot="start"></ion-icon>
      }
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
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          (click)="show = !show"
          type="button"
        >
          <ion-icon
            [name]="show ? 'eye-off-outline' : 'eye-outline'"
          ></ion-icon>
        </ion-button>
      }
    </ion-item>
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
  val: string | number | null | undefined = '';
  disabled = false;
  show = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }
  get actualType() {
    return this.togglePassword ? (this.show ? 'text' : 'password') : this.type;
  }
  onInput(e: CustomEvent) {
    this.val = (e.detail as { value?: string }).value ?? '';
    this.change(this.val);
  }
  touch() {
    this.touched();
  }
  writeValue(v: unknown): void {
    this.val = (v as string) ?? '';
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.change = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled = d;
  }
}

@Component({
  selector: 'app-ui-textarea',
  standalone: true,
  imports: [FormsModule, IonItem, IonTextarea],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaComponent),
      multi: true,
    },
  ],
  template: ` <div class="ui-field">
    @if (label) {
      <label>{{ label }}</label>
    }
    <ion-item lines="none">
      <ion-textarea
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        (ionInput)="onInput($event)"
        (ionBlur)="touch()"
      />
    </ion-item>
  </div>`,
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  val: string | null | undefined = '';
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onInput(e: CustomEvent) {
    this.val = (e.detail as { value?: string }).value ?? '';
    this.change(this.val);
  }
  touch() {
    this.touched();
  }
  writeValue(v: unknown): void {
    this.val = (v as string) ?? '';
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.change = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled = d;
  }
}

@Component({
  selector: 'app-ui-select',
  standalone: true,
  imports: [FormsModule, IonItem, IonSelect, IonSelectOption],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  template: ` <div class="ui-field">
    @if (label) {
      <label>{{ label }}</label>
    }
    <ion-item lines="none">
      <ion-select
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        [interface]="iface"
        (ionChange)="onChange($event)"
        (ionBlur)="touch()"
      >
        @for (o of options; track o.value) {
          <ion-select-option [value]="o.value">{{ o.label }}</ion-select-option>
        }
      </ion-select>
    </ion-item>
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
  onChange(e: CustomEvent) {
    this.val = (e.detail as { value?: string }).value ?? '';
    this.change(this.val);
  }
  touch() {
    this.touched();
  }
  writeValue(v: unknown): void {
    this.val = (v as string) ?? '';
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.change = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled = d;
  }
}

@Component({
  selector: 'app-ui-datepicker',
  standalone: true,
  imports: [FormsModule, IonItem, IonInput],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDatepickerComponent),
      multi: true,
    },
  ],
  template: ` <div class="ui-field">
    @if (label) {
      <label>{{ label }}</label>
    }
    <ion-item lines="none">
      <ion-input
        type="date"
        [value]="val"
        [disabled]="disabled"
        (ionInput)="onInput($event)"
        (ionBlur)="touch()"
      />
    </ion-item>
  </div>`,
})
export class UiDatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  val = '';
  disabled = false;
  private change: (v: unknown) => void = () => {};
  private touched: () => void = () => {};
  onInput(e: CustomEvent) {
    this.val = (e.detail as { value?: string }).value ?? '';
    this.change(this.val);
  }
  touch() {
    this.touched();
  }
  writeValue(v: unknown): void {
    this.val = typeof v === 'string' ? v : '';
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.change = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled = d;
  }
}

@Component({
  selector: 'app-ui-multi-select',
  standalone: true,
  imports: [FormsModule, IonItem, IonSelect, IonSelectOption],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiMultiSelectComponent),
      multi: true,
    },
  ],
  template: ` <div class="ui-field">
    @if (label) {
      <label>{{ label }}</label>
    }
    <ion-item lines="none">
      <ion-select
        [multiple]="true"
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        [interface]="iface"
        (ionChange)="onChange($event)"
        (ionBlur)="touch()"
      >
        @for (o of options; track o.value) {
          <ion-select-option [value]="o.value">{{ o.label }}</ion-select-option>
        }
      </ion-select>
    </ion-item>
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
  onChange(e: CustomEvent) {
    this.val = ((e.detail as { value?: string[] }).value ?? []) as string[];
    this.change(this.val);
  }
  touch() {
    this.touched();
  }
  writeValue(v: unknown): void {
    this.val = Array.isArray(v) ? (v as string[]) : [];
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.change = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled = d;
  }
}

@Component({
  selector: 'app-ui-number',
  standalone: true,
  imports: [FormsModule, IonItem, IonInput],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiNumberComponent),
      multi: true,
    },
  ],
  template: ` <div class="ui-field">
    @if (label) {
      <label>{{ label }}</label>
    }
    <ion-item lines="none">
      <ion-input
        type="number"
        [placeholder]="placeholder"
        [value]="val"
        [disabled]="disabled"
        (ionInput)="onInput($event)"
        (ionBlur)="touch()"
      />
    </ion-item>
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
  touch() {
    this.touched();
  }
  writeValue(v: unknown): void {
    this.val = (v as number) ?? null;
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.change = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled = d;
  }
}

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [IonButton, IonSpinner, IonIcon],
  template: ` <ion-button
    [expand]="expand"
    [fill]="fill"
    [color]="color"
    [size]="size"
    [disabled]="disabled || loading"
    (click)="pressed.emit($event)"
    [class]="className"
  >
    @if (loading) {
      <ion-spinner name="crescent"></ion-spinner>
    } @else {
      @if (icon) {
        <ion-icon [name]="icon" slot="start"></ion-icon>
      }
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

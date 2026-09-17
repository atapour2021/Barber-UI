import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';
import {
  UiButtonComponent,
  UiInputComponent,
  UiSelectComponent,
} from '../../shared/ui/ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    UiInputComponent,
    UiSelectComponent,
    UiButtonComponent,
  ],
  template: ` <div class="auth-card">
    <div class="auth-head">
      <h2>{{ t.title }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>
    <div class="grid2">
      <app-ui-input
        [label]="t.nameLabel"
        [placeholder]="t.namePlaceholder"
        [(ngModel)]="dto.name"
      />
      <app-ui-input
        [label]="t.familyLabel"
        [placeholder]="t.familyPlaceholder"
        [(ngModel)]="dto.family"
      />
    </div>
    <app-ui-input
      [label]="t.nationalCodeLabel"
      [placeholder]="t.nationalCodePlaceholder"
      [(ngModel)]="dto.nationalCode"
      inputmode="numeric"
      [maxlength]="10"
    />
    <app-ui-input
      [label]="t.usernameLabel"
      placeholder="username"
      [(ngModel)]="dto.username"
      autocomplete="username"
    />
    <app-ui-input
      [label]="t.passwordLabel"
      [placeholder]="t.passwordPlaceholder"
      [(ngModel)]="dto.password"
      autocomplete="new-password"
      [togglePassword]="true"
    />
    <app-ui-input
      [label]="t.phoneLabel"
      [placeholder]="t.phonePlaceholder"
      [(ngModel)]="dto.phoneNumber"
      inputmode="tel"
    />
    <app-ui-select
      [label]="t.roleLabel"
      [placeholder]="t.rolePlaceholder"
      [(ngModel)]="dto.role"
      [options]="roleOpts"
    />
    @if (err) {
      <div class="alert-error">{{ err }}</div>
    }
    <app-ui-button
      [loading]="loading"
      [disabled]="loading"
      (pressed)="submit()"
      >{{ t.submit }}</app-ui-button
    >
    <p class="muted-center">
      {{ t.hasAccount }}
      <a routerLink="/login" class="link-strong">{{ t.loginLink }}</a>
    </p>
  </div>`,
  styles: [
    `
      .auth-card {
        padding: 2px 0 8px;
        width: 100%;
      }
      .auth-head h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 800;
      }
      .auth-head p {
        margin: 6px 0 14px;
        color: var(--ion-color-medium);
        font-size: 13px;
      }
      .link-strong {
        color: var(--ion-color-primary);
        text-decoration: none;
        font-weight: 700;
      }
      .muted-center {
        text-align: center;
        color: var(--ion-color-medium);
        font-size: 13px;
        margin-top: 12px;
      }
    `,
  ],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.register;
  dto: Record<string, unknown> = {
    role: 'customer',
    name: '',
    family: '',
    nationalCode: '',
    username: '',
    password: '',
    phoneNumber: '',
  };
  roleOpts = [
    { value: 'customer', label: fa.auth.register.roleCustomer },
    { value: 'barber', label: fa.auth.register.roleBarber },
    { value: 'user', label: fa.auth.register.roleUser },
  ];
  err = '';
  loading = false;
  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }
  submit() {
    this.err = '';
    const d = this.dto as Record<string, string>;
    const warn = (m: string) => {
      this.err = m;
      this.toast.warning(m);
    };
    if (!d['nationalCode'] || String(d['nationalCode']).length !== 10) {
      warn(this.t.errorNationalCode);
      return;
    }
    if (!d['name'] || !d['family'] || !d['username'] || !d['password']) {
      warn(this.t.errorRequired);
      return;
    }
    if (String(d['password']).length < 6) {
      warn(this.t.errorPasswordLength);
      return;
    }
    this.loading = true;
    this.auth.register(this.dto).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(fa.common.success);
        this.router.navigateByUrl('/tabs/home');
      },
      error: (e) => {
        this.loading = false;
        const m = extractMessage(e, this.t.errorFailed);
        this.err = m;
        this.toast.error(m);
      },
    });
  }
}

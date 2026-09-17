import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, keyOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { UiButtonComponent, UiInputComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule, UiInputComponent, UiButtonComponent],
  template: ` <div class="auth-card">
    <div class="auth-head">
      <h2>{{ t.title }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>
    <app-ui-input
      [label]="t.tokenLabel"
      icon="key-outline"
      [placeholder]="t.tokenPlaceholder"
      [(ngModel)]="token"
    />
    <app-ui-input
      [label]="t.passwordLabel"
      [placeholder]="t.passwordPlaceholder"
      [(ngModel)]="pwd"
      [togglePassword]="true"
    />
    @if (msg) {
      <div [class]="ok ? 'alert-ok' : 'alert-error'">{{ msg }}</div>
    }
    <app-ui-button
      [loading]="loading"
      [disabled]="loading || !token || !pwd"
      (pressed)="submit()"
      >{{ t.submit }}</app-ui-button
    >
    <p class="hint">{{ t.hint }}</p>
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
      .hint {
        text-align: center;
        color: var(--ion-color-medium);
        font-size: 11px;
        margin-top: 10px;
      }
    `,
  ],
})
export class ResetPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  t = fa.auth.reset;
  token = '';
  pwd = '';
  msg = '';
  ok = false;
  loading = false;
  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, keyOutline });
  }
  submit() {
    this.loading = true;
    this.msg = '';
    this.auth
      .reset({ token: this.token.trim(), password: this.pwd })
      .subscribe({
        next: () => {
          this.loading = false;
          this.ok = true;
          this.msg = this.t.success;
          setTimeout(() => this.router.navigateByUrl('/login'), 1200);
        },
        error: (e) => {
          this.loading = false;
          this.ok = false;
          this.msg = e.error?.message ?? this.t.errorFailed;
        },
      });
  }
}

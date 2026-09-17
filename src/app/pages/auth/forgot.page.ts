import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline, personOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { UiButtonComponent, UiInputComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, UiInputComponent, UiButtonComponent],
  template: ` <div class="auth-card">
    <div class="auth-head">
      <h2>{{ t.title }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>
    <app-ui-input
      [label]="t.label"
      [placeholder]="t.placeholder"
      [(ngModel)]="val"
      [icon]="val.includes('@') ? 'mail-outline' : 'person-outline'"
    />
    @if (msg) {
      <div [class]="ok ? 'alert-ok' : 'alert-error'">{{ msg }}</div>
    }
    @if (token) {
      <div class="token-box">
        <p class="token-label">{{ t.tokenLabel }}</p>
        <p class="token-val">{{ token }}</p>
      </div>
    }
    <app-ui-button
      [loading]="loading"
      [disabled]="loading || !val"
      (pressed)="submit()"
      >{{ t.submit }}</app-ui-button
    >
    <div class="row-links">
      <a routerLink="/reset" class="link">{{ t.hasTokenLink }}</a>
      <a routerLink="/login" class="link">{{ t.backToLogin }}</a>
    </div>
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
        font-size: 12px;
        line-height: 1.6;
      }
      .token-box {
        border: 1px dashed var(--ion-color-medium);
        border-radius: 12px;
        padding: 10px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;
      }
      .token-label {
        margin: 0 0 6px;
        color: var(--ion-color-medium);
        font-size: 11px;
      }
      .token-val {
        margin: 0;
        word-break: break-all;
        font-family: monospace;
        font-size: 11px;
        direction: ltr;
        text-align: left;
      }
      .row-links {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 14px;
      }
      .link {
        font-size: 12px;
        text-decoration: none;
        color: var(--ion-color-primary);
      }
    `,
  ],
})
export class ForgotPage {
  private auth = inject(AuthService);
  t = fa.auth.forgot;
  val = '';
  msg = '';
  token = '';
  ok = false;
  loading = false;
  constructor() {
    addIcons({ mailOutline, personOutline });
  }
  submit() {
    this.loading = true;
    this.msg = '';
    this.token = '';
    const isEmail = this.val.includes('@');
    this.auth
      .forgot(
        isEmail ? { email: this.val.trim() } : { username: this.val.trim() },
      )
      .subscribe({
        next: (r: unknown) => {
          this.loading = false;
          this.ok = true;
          const x = r as Record<string, unknown>;
          this.token = (x['reset_token'] as string) ?? '';
          this.msg = this.token
            ? this.t.successWithToken
            : this.t.successWithoutToken;
        },
        error: (e) => {
          this.loading = false;
          this.ok = false;
          this.msg = e.error?.message ?? this.t.errorFailed;
        },
      });
  }
}

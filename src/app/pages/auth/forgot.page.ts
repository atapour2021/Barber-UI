import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonInput, IonItem } from '@ionic/angular';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, IonItem, IonInput, IonButton],
  template: `
    <div class="auth-form">
      <div class="input-group">
        <label>{{ t.label }}</label>
        <ion-item lines="none" class="custom-input">
          <ion-input [placeholder]="t.placeholder" [(ngModel)]="val"></ion-input>
        </ion-item>
      </div>
      @if (msg) {
        <div [class]="ok ? 'alert-ok' : 'alert-error'">{{ msg }}</div>
      }
      @if (token) {
        <div class="token-box">
          <p class="token-label">{{ t.tokenLabel }}</p>
          <p class="token-val">{{ token }}</p>
        </div>
      }
      <ion-button expand="block" class="submit-btn" [disabled]="loading || !val" (click)="submit()">{{ t.submit }}</ion-button>
      <div class="row-links">
        <a routerLink="/reset" class="link">{{ t.hasTokenLink }}</a>
        <a routerLink="/login" class="link">{{ t.backToLogin }}</a>
      </div>
    </div>
  `,
})
export class ForgotPage {
  private auth = inject(AuthService);
  t = fa.auth.forgot;
  val = '';
  msg = '';
  token = '';
  ok = false;
  loading = false;
  submit() {
    this.loading = true;
    this.msg = '';
    this.token = '';
    const isEmail = this.val.includes('@');
    this.auth.forgot(isEmail ? { email: this.val.trim() } : { username: this.val.trim() }).subscribe({
      next: (r: unknown) => {
        this.loading = false;
        this.ok = true;
        const x = r as Record<string, unknown>;
        this.token = (x['reset_token'] as string) ?? '';
        this.msg = this.token ? this.t.successWithToken : this.t.successWithoutToken;
      },
      error: (e) => {
        this.loading = false;
        this.ok = false;
        this.msg = e.error?.message ?? this.t.errorFailed;
      },
    });
  }
}

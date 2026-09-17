import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonCheckbox } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  personOutline,
} from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';
import { UiButtonComponent, UiInputComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonCheckbox,
    UiInputComponent,
    UiButtonComponent,
  ],
  template: ` <div class="auth-card">
    <div class="auth-head">
      <h2>{{ t.title }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>
    <app-ui-input
      [label]="t.usernameLabel"
      icon="person-outline"
      [placeholder]="t.usernamePlaceholder"
      [(ngModel)]="username"
      autocomplete="username"
      inputmode="text"
    />
    <div class="field">
      <app-ui-input
        [label]="t.passwordLabel"
        icon="lock-closed-outline"
        [placeholder]="t.passwordPlaceholder"
        [(ngModel)]="password"
        autocomplete="current-password"
        [togglePassword]="true"
      />
      <div class="row-between">
        <label class="remember"
          ><ion-checkbox [(ngModel)]="remember"></ion-checkbox>
          {{ t.remember }}</label
        >
        <a routerLink="/forgot" class="link">{{ t.forgotLink }}</a>
      </div>
    </div>
    @if (err) {
      <div class="alert-error">{{ err }}</div>
    }
    <app-ui-button
      [loading]="loading"
      [disabled]="loading"
      (pressed)="login()"
      >{{ t.submit }}</app-ui-button
    >
    <p class="muted-center">
      {{ t.noAccount }}
      <a routerLink="/register" class="link-strong">{{ t.registerLink }}</a>
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
      .field {
        margin-bottom: 12px;
      }
      .row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        gap: 8px;
      }
      .remember {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--ion-color-medium);
      }
      .link {
        font-size: 12px;
        text-decoration: none;
        color: var(--ion-color-primary);
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
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.login;
  username = environment.production ? '' : 'superadmin';
  password = environment.production ? '' : 'SuperAdmin123!';
  err = '';
  loading = false;
  remember = true;
  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, personOutline, lockClosedOutline });
  }
  login() {
    if (!this.username || !this.password) {
      this.err = this.t.errorEmpty;
      this.toast.warning(this.t.errorEmpty);
      return;
    }
    this.err = '';
    this.loading = true;
    this.auth
      .login({ username: this.username.trim(), password: this.password })
      .subscribe({
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

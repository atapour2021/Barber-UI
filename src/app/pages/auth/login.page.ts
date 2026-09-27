import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cutOutline } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';
import { UiInputComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    UiInputComponent,
    UiButtonComponent,
  ],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="auth-wrapper" dir="rtl">
        <div class="auth-header">
          <a routerLink="/landing" class="back-btn" aria-label="back"
            ><ion-icon name="arrow-forward-outline"></ion-icon
          ></a>
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <span class="auth-header-spacer" aria-hidden="true"></span>
        </div>
        <div class="auth-titles">
          <h1 class="title">{{ t.title }}</h1>
          <p class="subtitle">{{ t.subtitle }}</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <app-ui-input
            formControlName="username"
            [label]="t.usernameLabel"
            [placeholder]="t.usernamePlaceholder"
            type="tel"
            [ltr]="true"
          />
          <app-ui-input
            formControlName="password"
            [label]="t.passwordLabel"
            [placeholder]="t.passwordPlaceholder"
            type="password"
            [togglePassword]="true"
          />
          @if (err) {
            <div class="alert-error">{{ err }}</div>
          }
          <app-ui-button
            size="large"
            [disabled]="loginForm.invalid || loading"
            [loading]="loading"
            (pressed)="onSubmit()"
            >{{ t.submit }}</app-ui-button
          >
          <div class="forgot-password">
            <a routerLink="/forgot">{{ t.forgotLink }}</a>
          </div>
        </form>
        <div class="footer">
          <span>{{ t.noAccount }} </span
          ><a routerLink="/register">{{ t.registerLink }}</a>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .auth-wrapper {
        min-height: 100%;
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
        box-sizing: border-box;
        gap: 0;
      }
      .auth-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 40px;
        margin-bottom: 0;
      }
      .auth-header .back-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        font-size: 20px;
        color: var(--ion-text-color);
        text-decoration: none;
        transform: scaleX(-1);
      }
      .auth-header .logo-box {
        width: 48px;
        height: 48px;
      }
      .auth-header .auth-header-spacer {
        width: 36px;
        height: 36px;
      }
      .auth-titles {
        margin: 10px 0 0;
        padding: 0;
        text-align: center;
      }
      .auth-titles .title {
        margin: 0 0 4px;
        font-size: 22px;
        font-weight: 700;
      }
      .auth-titles .subtitle {
        margin: 0;
        font-size: 12px;
        color: var(--ion-color-medium);
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
      }
      .alert-error {
        overflow-wrap: break-word;
        word-break: break-word;
      }
      .auth-form .forgot-password {
        margin: 0;
        text-align: end;
      }
      .auth-form .forgot-password a {
        color: var(--ion-color-primary);
        text-decoration: none;
        font-size: 12px;
        font-weight: 600;
      }
      .auth-wrapper .footer {
        margin-top: auto;
        padding-top: 12px;
        text-align: center;
        font-size: 13px;
      }
      .auth-wrapper .footer a {
        color: var(--ion-color-primary);
        text-decoration: none;
        font-weight: 700;
      }
      @media (min-width: 640px) {
        .auth-wrapper {
          padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
        }
      }
    `,
  ],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.login;
  err = '';
  loading = false;
  username = environment.production ? '' : 'superadmin';
  password = environment.production ? '' : 'SuperAdmin123!';
  loginForm: FormGroup = this.fb.group({
    username: [this.username, [Validators.required]],
    password: [this.password, [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({ cutOutline, arrowForwardOutline });
  }
  onSubmit() {
    if (this.loginForm.invalid) {
      this.err = this.t.errorEmpty;
      this.toast.warning(this.t.errorEmpty);
      return;
    }
    const { username, password } = this.loginForm.value as {
      username: string;
      password: string;
    };
    if (!username?.trim() || !password) {
      this.err = this.t.errorEmpty;
      this.toast.warning(this.t.errorEmpty);
      return;
    }
    this.err = '';
    this.loading = true;
    this.auth.login({ username: username.trim(), password }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(fa.common.success);
        this.theme.loadFromApi();
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
  login() {
    return this.onSubmit();
  }
}

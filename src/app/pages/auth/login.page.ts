import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  cutOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  personOutline
} from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
  ],
  template: `
    <ion-content [fullscreen]="true" class="login-content">
      <div class="login-wrapper" dir="rtl">
        <div class="header-nav">
          <a routerLink="/landing"
            ><ion-icon name="arrow-forward-outline" class="back-icon"></ion-icon
          ></a>
        </div>
        <div class="logo-section">
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <h1 class="title">خوش آمدید</h1>
          <p class="subtitle">برای ادامه اطلاعات خود را وارد کنید</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="input-group">
            <label>{{ t.usernameLabel }}</label>
            <ion-item lines="none" class="custom-input">
              <ion-input
                formControlName="username"
                type="tel"
                [placeholder]="t.usernamePlaceholder"
              ></ion-input>
            </ion-item>
          </div>
          <div class="input-group">
            <label>{{ t.passwordLabel }}</label>
            <ion-item lines="none" class="custom-input">
              <ion-input
                formControlName="password"
                type="password"
                [placeholder]="t.passwordPlaceholder"
              ></ion-input>
            </ion-item>
          </div>
          @if (err) {
            <div class="alert-error">{{ err }}</div>
          }
          <ion-button
            expand="block"
            type="submit"
            class="submit-btn"
            [disabled]="loginForm.invalid || loading"
            >ورود</ion-button
          >
          <div class="forgot-password">
            <a routerLink="/forgot">رمز عبور را فراموش کرده‌اید؟</a>
          </div>
        </form>
        <div class="footer">
          <span>حساب ندارید؟ </span><a routerLink="/register">ثبت‌نام</a>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host {
        --bg-color: #0b0e14;
        --input-bg: #151b26;
        --primary-color: #ffa500;
        --text-color: #ffffff;
        --text-muted: #8c96a5;
        display: block;
        height: 100%;
      }
      ion-content.login-content {
        --background: var(--bg-color);
        --color: var(--text-color);
        font-family: 'Vazirmatn', sans-serif;
      }
      .login-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 100%;
        padding: 24px;
        max-width: 500px;
        margin: 0 auto;
        position: relative;
      }
      .header-nav {
        position: absolute;
        top: 20px;
        left: 20px;
        font-size: 24px;
        color: white;
        cursor: pointer;
      }
      .header-nav a {
        color: inherit;
      }
      .logo-section {
        text-align: center;
        margin-bottom: 40px;
      }
      .logo-box {
        width: 60px;
        height: 60px;
        background-color: var(--primary-color);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px auto;
        box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
      }
      .logo-box ion-icon {
        font-size: 32px;
        color: #000;
        transform: rotate(-90deg);
      }
      .title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        color: var(--text-color);
      }
      .subtitle {
        font-size: 14px;
        color: var(--text-muted);
        margin: 0;
      }
      .auth-form {
        width: 100%;
      }
      .input-group {
        margin-bottom: 20px;
      }
      .input-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color);
        padding-right: 4px;
      }
      .custom-input {
        --background: var(--input-bg);
        --border-radius: 8px;
        --padding-start: 16px;
        --padding-end: 16px;
        --min-height: 55px;
        border: 1px solid transparent;
        transition: border-color 0.3s ease;
      }
      .custom-input.item-has-focus {
        border: 1px solid var(--primary-color);
        --background: #1a2230;
      }
      .custom-input ion-input {
        --color: var(--text-color);
        --placeholder-color: #5a6270;
        --placeholder-opacity: 1;
        font-size: 15px;
        direction: ltr;
        text-align: left;
      }
      .submit-btn {
        --background: var(--primary-color);
        --background-activated: #e69500;
        --background-hover: #ffb733;
        --color: #000000;
        --border-radius: 8px;
        --box-shadow: none;
        --padding-top: 14px;
        --padding-bottom: 14px;
        font-weight: 700;
        font-size: 16px;
        margin-top: 30px;
        height: 54px;
      }
      .forgot-password {
        text-align: center;
        margin-top: 20px;
      }
      .forgot-password a {
        color: var(--primary-color);
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
      }
      .footer {
        margin-top: auto;
        padding-top: 40px;
        text-align: center;
        font-size: 14px;
        color: var(--text-muted);
      }
      .footer a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 700;
        margin-right: 4px;
      }
      [dir='rtl'] .header-nav {
        left: auto;
        right: 20px;
        transform: scaleX(-1);
      }
      .alert-error {
        background: #2a1215;
        color: #ff8a8a;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 13px;
        margin-bottom: 12px;
      }
    `,
  ],
})
export class LoginPage {
  loginForm: FormGroup;
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.login;
  err = '';
  loading = false;
  username = environment.production ? '' : 'superadmin';
  password = environment.production ? '' : 'SuperAdmin123!';

  constructor(private fb: FormBuilder) {
    addIcons({ cutOutline, arrowForwardOutline});
    addIcons({ eyeOutline, eyeOffOutline, personOutline, lockClosedOutline });
    this.loginForm = this.fb.group({
      username: [this.username, [Validators.required]],
      password: [this.password, [Validators.required, Validators.minLength(6)]],
    });
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

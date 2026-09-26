import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cutOutline } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonIcon, IonItem, IonInput, IonButton],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="auth-wrapper" dir="rtl">
        <div class="auth-header">
          <a routerLink="/landing" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <span class="auth-header-spacer" aria-hidden="true"></span>
        </div>
        <div class="auth-titles">
          <h1 class="title">{{ t.title }}</h1>
          <p class="subtitle">{{ t.subtitle }}</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="input-group">
            <label>{{ t.usernameLabel }}</label>
            <ion-item lines="none" class="custom-input">
              <ion-input formControlName="username" type="tel" [placeholder]="t.usernamePlaceholder"></ion-input>
            </ion-item>
          </div>
          <div class="input-group">
            <label>{{ t.passwordLabel }}</label>
            <ion-item lines="none" class="custom-input">
              <ion-input formControlName="password" type="password" [placeholder]="t.passwordPlaceholder"></ion-input>
            </ion-item>
          </div>
          @if (err) {
            <div class="alert-error">{{ err }}</div>
          }
          <ion-button expand="block" type="submit" class="submit-btn" [disabled]="loginForm.invalid || loading">{{ t.submit }}</ion-button>
          <div class="forgot-password">
            <a routerLink="/forgot">{{ t.forgotLink }}</a>
          </div>
        </form>
        <div class="footer">
          <span>{{ t.noAccount }} </span><a routerLink="/register">{{ t.registerLink }}</a>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host { display: block; height: 100%; }
      .alert-error { margin-top: 12px; overflow-wrap: break-word; word-break: break-word; }
    `,
  ],
})
export class LoginPage {
  loginForm: FormGroup;
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.login;
  err = '';
  loading = false;
  username = environment.production ? '' : 'superadmin';
  password = environment.production ? '' : 'SuperAdmin123!';

  constructor(private fb: FormBuilder) {
    addIcons({ cutOutline, arrowForwardOutline });
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
    const { username, password } = this.loginForm.value as { username: string; password: string };
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

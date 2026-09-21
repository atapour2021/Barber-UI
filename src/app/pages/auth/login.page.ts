import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, IonItem } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonItem, IonInput, IonButton],
  template: `
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
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .footer {
        margin-top: auto;
        padding-top: 24px;
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

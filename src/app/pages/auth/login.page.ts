import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonInput, IonButton, IonSpinner, IonIcon, IonItem, IonCheckbox } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, personOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonInput, IonButton, IonSpinner, IonIcon, IonItem, IonCheckbox],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>{{t.title}}</h2>
        <p>{{t.subtitle}}</p>
      </div>

      <div class="field">
        <label>{{t.usernameLabel}}</label>
        <ion-item lines="none">
          <ion-icon name="person-outline" slot="start"></ion-icon>
          <ion-input [placeholder]="t.usernamePlaceholder" [(ngModel)]="username" autocomplete="username" inputmode="text"></ion-input>
        </ion-item>
      </div>

      <div class="field">
        <label>{{t.passwordLabel}}</label>
        <ion-item lines="none">
          <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
          <ion-input [type]="showPwd ? 'text' : 'password'" [placeholder]="t.passwordPlaceholder" [(ngModel)]="password" autocomplete="current-password"></ion-input>
          <ion-button slot="end" fill="clear" size="small" (click)="showPwd=!showPwd"><ion-icon [name]="showPwd ? 'eye-off-outline' : 'eye-outline'"></ion-icon></ion-button>
        </ion-item>
        <div class="row-between">
          <label class="remember"><ion-checkbox [(ngModel)]="remember"></ion-checkbox> {{t.remember}}</label>
          <a routerLink="/forgot" class="link">{{t.forgotLink}}</a>
        </div>
      </div>

      @if (err) { <div class="alert-error">{{err}}</div> }

      <ion-button expand="block" class="primary-btn" (click)="login()" [disabled]="loading">
        @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { {{t.submit}} }
      </ion-button>

      <p class="muted-center">{{t.noAccount}} <a routerLink="/register" class="link-strong">{{t.registerLink}}</a></p>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:13px}
  .field{margin-bottom:12px}
  .field label{font-size:12px;color:var(--ion-color-medium);display:block;margin-bottom:6px}
  .row-between{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px}
  .remember{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ion-color-medium)}
  .link{font-size:12px;text-decoration:none;color:var(--ion-color-primary)}
  .link-strong{color:var(--ion-color-primary);text-decoration:none;font-weight:700}
  .muted-center{text-align:center;color:var(--ion-color-medium);font-size:13px;margin-top:12px}
  .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .primary-btn{--border-radius:14px;height:48px;font-weight:700;margin-top:4px}
  `],
})
export class LoginPage {
  private auth = inject(AuthService); private router = inject(Router);
  t = fa.auth.login;
  username = ''; password = ''; err = ''; loading = false; showPwd = false; remember = true;
  constructor(){ addIcons({ eyeOutline, eyeOffOutline, personOutline, lockClosedOutline }); }
  login() {
    if(!this.username || !this.password){ this.err=this.t.errorEmpty; return; }
    this.err=''; this.loading=true;
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => { this.loading=false; this.router.navigateByUrl('/tabs/home'); },
      error: e => { this.loading=false; this.err = e.error?.message ?? this.t.errorFailed; },
    });
  }
}

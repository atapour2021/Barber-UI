import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonSpinner, IonIcon, IonItem, IonCheckbox } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, personOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { environment } from '../../../environments/environment';
import { UiInputComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonSpinner, IonIcon, IonItem, IonCheckbox, UiInputComponent, UiButtonComponent],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>{{t.title}}</h2>
        <p>{{t.subtitle}}</p>
      </div>
      <ui-input [label]="t.usernameLabel" icon="person-outline" [placeholder]="t.usernamePlaceholder" [(ngModel)]="username" autocomplete="username" inputmode="text" />
      <div class="field">
        <ui-input [label]="t.passwordLabel" icon="lock-closed-outline" [placeholder]="t.passwordPlaceholder" [(ngModel)]="password" autocomplete="current-password" [togglePassword]="true" />
        <div class="row-between">
          <label class="remember"><ion-checkbox [(ngModel)]="remember"></ion-checkbox> {{t.remember}}</label>
          <a routerLink="/forgot" class="link">{{t.forgotLink}}</a>
        </div>
      </div>
      @if (err) { <div class="alert-error">{{err}}</div> }
      <ui-button [loading]="loading" [disabled]="loading" (pressed)="login()">{{t.submit}}</ui-button>
      <p class="muted-center">{{t.noAccount}} <a routerLink="/register" class="link-strong">{{t.registerLink}}</a></p>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px;width:100%}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:13px}
  .field{margin-bottom:12px}
  .row-between{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px}
  .remember{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ion-color-medium)}
  .link{font-size:12px;text-decoration:none;color:var(--ion-color-primary)}
  .link-strong{color:var(--ion-color-primary);text-decoration:none;font-weight:700}
  .muted-center{text-align:center;color:var(--ion-color-medium);font-size:13px;margin-top:12px}
  `],
})
export class LoginPage {
  private auth = inject(AuthService); private router = inject(Router);
  t = fa.auth.login;
  username = environment.production ? '' : 'superadmin';
  password = environment.production ? '' : 'SuperAdmin123!';
  err = ''; loading = false; remember = true;
  constructor(){ addIcons({ eyeOutline, eyeOffOutline, personOutline, lockClosedOutline }); }
  login() {
    if(!this.username || !this.password){ this.err=this.t.errorEmpty; return; }
    this.err=''; this.loading=true;
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => { this.loading=false; this.router.navigateByUrl('/tabs/home'); },
      error: e => { this.loading=false; this.err=extractMessage(e, this.t.errorFailed); },
    });
  }
}

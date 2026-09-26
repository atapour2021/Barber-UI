import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cutOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonIcon, IonItem, IonInput, IonButton],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="auth-wrapper" dir="rtl">
        <div class="auth-header">
          <a routerLink="/login" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <span class="auth-header-spacer" aria-hidden="true"></span>
        </div>
        <div class="auth-titles">
          <h1 class="title">{{ t.title }}</h1>
          <p class="subtitle">{{ t.subtitle }}</p>
        </div>
        <div class="auth-form">
          <div class="input-group">
            <label>{{ t.tokenLabel }}</label>
            <ion-item lines="none" class="custom-input">
              <ion-input [placeholder]="t.tokenPlaceholder" [(ngModel)]="token"></ion-input>
            </ion-item>
          </div>
          <div class="input-group">
            <label>{{ t.passwordLabel }}</label>
            <ion-item lines="none" class="custom-input">
              <ion-input [placeholder]="t.passwordPlaceholder" [(ngModel)]="pwd" type="password"></ion-input>
            </ion-item>
          </div>
          @if (msg) {
            <div [class]="ok ? 'alert-ok' : 'alert-error'">{{ msg }}</div>
          }
          <ion-button expand="block" class="submit-btn" [disabled]="loading || !token || !pwd" (click)="submit()">{{ t.submit }}</ion-button>
          <p class="hint">{{ t.hint }}</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host { display:block; height:100%; }
    .alert-ok, .alert-error { overflow-wrap:break-word; word-break:break-word; }
    .hint { overflow-wrap:break-word; }
  `],
})
export class ResetPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  t = fa.auth.reset;
  constructor() { addIcons({ cutOutline, arrowForwardOutline }); }
  token = '';
  pwd = '';
  msg = '';
  ok = false;
  loading = false;
  submit() {
    this.loading = true;
    this.msg = '';
    this.auth.reset({ token: this.token.trim(), password: this.pwd }).subscribe({
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

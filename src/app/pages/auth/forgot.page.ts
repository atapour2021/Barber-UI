import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cutOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { UiInputComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonIcon, UiInputComponent, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="auth-wrapper" dir="rtl">
        <div class="auth-header">
          <a routerLink="/login" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <span class="auth-header-spacer" aria-hidden="true"></span>
        </div>
        <div class="auth-titles"><h1 class="title">{{ t.title }}</h1><p class="subtitle">{{ t.subtitle }}</p></div>
        <div class="auth-form">
          <app-ui-input [label]="t.label" [placeholder]="t.placeholder" [(ngModel)]="val" [ltr]="true" />
          @if (msg) { <div [class]="ok ? 'alert-ok' : 'alert-error'">{{ msg }}</div> }
          @if (token) { <div class="token-box"><p class="token-label">{{ t.tokenLabel }}</p><p class="token-val">{{ token }}</p></div> }
          <app-ui-button size="large" [disabled]="!val" [loading]="loading" (pressed)="submit()">{{ t.submit }}</app-ui-button>
          <div class="row-links"><a routerLink="/reset" class="link">{{ t.hasTokenLink }}</a><a routerLink="/login" class="link">{{ t.backToLogin }}</a></div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`:host { display:block; height:100%; } .auth-form{ display:grid; gap:14px; } .token-box { overflow:hidden; } .alert-ok, .alert-error { overflow-wrap:break-word; word-break:break-word; }`],
})
export class ForgotPage {
  private auth = inject(AuthService);
  t = fa.auth.forgot;
  constructor() { addIcons({ cutOutline, arrowForwardOutline }); }
  val = ''; msg = ''; token = ''; ok = false; loading = false;
  submit() {
    this.loading = true; this.msg = ''; this.token = '';
    const isEmail = this.val.includes('@');
    this.auth.forgot(isEmail ? { email: this.val.trim() } : { username: this.val.trim() }).subscribe({
      next: (r: unknown) => { this.loading = false; this.ok = true; const x = r as Record<string, unknown>; this.token = (x['reset_token'] as string) ?? ''; this.msg = this.token ? this.t.successWithToken : this.t.successWithoutToken; },
      error: (e) => { this.loading = false; this.ok = false; this.msg = e.error?.message ?? this.t.errorFailed; },
    });
  }
}

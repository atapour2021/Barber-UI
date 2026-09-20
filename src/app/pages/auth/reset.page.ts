import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonInput, IonItem } from '@ionic/angular';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule, IonItem, IonInput, IonButton],
  template: `
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
  `,
})
export class ResetPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  t = fa.auth.reset;
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

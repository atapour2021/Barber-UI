import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner],
  template: `
  <ion-header><ion-toolbar><ion-title>Forgot password</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-input label="Email or Username" labelPlacement="stacked" [(ngModel)]="val" /></ion-item>
    @if (msg) { <ion-text [color]="ok?'success':'danger'"><p>{{msg}}</p></ion-text> }
    @if (token) { <ion-text color="medium"><p style="word-break:break-all">Reset token: {{token}}</p></ion-text> }
    <ion-button expand="block" (click)="submit()" [disabled]="loading">@if (loading) { <ion-spinner /> } @else { Send }</ion-button>
    <ion-button fill="clear" expand="block" routerLink="/reset">Have token? Reset</ion-button>
  </ion-content>`,
})
export class ForgotPage {
  private auth = inject(AuthService);
  val = ''; msg = ''; token = ''; ok = false; loading = false;
  submit() {
    this.loading = true; this.msg = ''; this.token = '';
    const isEmail = this.val.includes('@');
    this.auth.forgot(isEmail ? { email: this.val } : { username: this.val }).subscribe({
      next: (r: unknown) => {
        this.loading = false; this.ok = true;
        const x = r as Record<string, unknown>;
        this.token = (x['reset_token'] as string) ?? '';
        this.msg = this.token ? 'Token generated (dev mode)' : 'If account exists, reset token sent';
      },
      error: e => { this.loading = false; this.ok = false; this.msg = e.error?.message ?? 'Failed'; },
    });
  }
}

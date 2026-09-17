import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner],
  template: `
  <ion-header><ion-toolbar><ion-title>Reset password</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-input label="Reset token" labelPlacement="stacked" [(ngModel)]="token" /></ion-item>
    <ion-item><ion-input label="New password" labelPlacement="stacked" type="password" [(ngModel)]="pwd" /></ion-item>
    @if (msg) { <ion-text [color]="ok?'success':'danger'"><p>{{msg}}</p></ion-text> }
    <ion-button expand="block" (click)="submit()" [disabled]="loading">@if (loading) { <ion-spinner /> } @else { Reset }</ion-button>
  </ion-content>`,
})
export class ResetPage {
  private auth = inject(AuthService); private router = inject(Router);
  token = ''; pwd = ''; msg = ''; ok = false; loading = false;
  submit() {
    this.loading = true; this.msg = '';
    this.auth.reset({ token: this.token, password: this.pwd }).subscribe({
      next: () => { this.loading = false; this.ok = true; this.msg = 'Password reset. Redirecting to login...'; setTimeout(() => this.router.navigateByUrl('/login'), 1200); },
      error: e => { this.loading = false; this.ok = false; this.msg = e.error?.message ?? 'Failed'; },
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner],
  template: `
  <ion-header><ion-toolbar><ion-title>Login</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-input label="Username" labelPlacement="stacked" [(ngModel)]="username" /></ion-item>
    <ion-item><ion-input label="Password" labelPlacement="stacked" type="password" [(ngModel)]="password" /></ion-item>
    @if (err) { <ion-text color="danger"><p>{{err}}</p></ion-text> }
    <ion-button expand="block" (click)="login()" [disabled]="loading">@if (loading) { <ion-spinner /> } @else { Login }</ion-button>
    <ion-button fill="clear" expand="block" routerLink="/register">Create account</ion-button>
    <ion-button fill="clear" expand="block" routerLink="/forgot">Forgot password?</ion-button>
  </ion-content>`,
})
export class LoginPage {
  private auth = inject(AuthService); private router = inject(Router);
  username = ''; password = ''; err = ''; loading = false;
  login() {
    this.err = ''; this.loading = true;
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => { this.loading = false; this.router.navigateByUrl('/tabs/home'); },
      error: e => { this.loading = false; this.err = e.error?.message ?? 'Login failed'; },
    });
  }
}

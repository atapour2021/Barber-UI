import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner, IonSelect, IonSelectOption } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner, IonSelect, IonSelectOption],
  template: `
  <ion-header><ion-toolbar><ion-title>Register</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-input label="National Code (10 digits)" labelPlacement="stacked" [(ngModel)]="dto.nationalCode" /></ion-item>
    <ion-item><ion-input label="Name" labelPlacement="stacked" [(ngModel)]="dto.name" /></ion-item>
    <ion-item><ion-input label="Family" labelPlacement="stacked" [(ngModel)]="dto.family" /></ion-item>
    <ion-item><ion-input label="Username" labelPlacement="stacked" [(ngModel)]="dto.username" /></ion-item>
    <ion-item><ion-input label="Password" labelPlacement="stacked" type="password" [(ngModel)]="dto.password" /></ion-item>
    <ion-item><ion-input label="Phone (09...)" labelPlacement="stacked" [(ngModel)]="dto.phoneNumber" /></ion-item>
    <ion-item>
      <ion-select label="Role" [(ngModel)]="dto.role">
        <ion-select-option value="customer">customer</ion-select-option>
        <ion-select-option value="barber">barber</ion-select-option>
        <ion-select-option value="user">user</ion-select-option>
      </ion-select>
    </ion-item>
    @if (err) { <ion-text color="danger"><p>{{err}}</p></ion-text> }
    <ion-button expand="block" (click)="submit()" [disabled]="loading">@if (loading) { <ion-spinner /> } @else { Register }</ion-button>
    <ion-button fill="clear" expand="block" routerLink="/login">Already have account? Login</ion-button>
  </ion-content>`,
})
export class RegisterPage {
  private auth = inject(AuthService); private router = inject(Router);
  dto: Record<string, unknown> = { role: 'customer' };
  err = ''; loading = false;
  submit() {
    this.err = ''; this.loading = true;
    this.auth.register(this.dto).subscribe({
      next: () => { this.loading = false; this.router.navigateByUrl('/tabs/home'); },
      error: e => { this.loading = false; this.err = e.error?.message ?? 'Register failed'; },
    });
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonText } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonText],
  template: `
  <ion-header><ion-toolbar><ion-title>Profile</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    @if (auth.user(); as u) {
      <ion-card>
        <ion-card-header><ion-card-title>{{u.name}} {{u.family}}</ion-card-title></ion-card-header>
        <ion-card-content>
          <p>Username: {{u.username}}</p>
          <p>Role: {{u.role}}</p>
          <p>Phone: {{u.phoneNumber}}</p>
          <p>National code: {{u.nationalCode}}</p>
        </ion-card-content>
      </ion-card>
    }
    @else { <ion-text color="medium"><p>Not logged in</p></ion-text> }
    <ion-button expand="block" color="danger" (click)="logout()">Logout</ion-button>
    <ion-button expand="block" fill="clear" color="danger" (click)="logoutAll()">Logout all devices</ion-button>
  </ion-content>`,
})
export class ProfilePage {
  auth = inject(AuthService); private router = inject(Router);
  logout() { this.auth.logout().subscribe({ next: () => this.router.navigateByUrl('/login'), error: () => this.router.navigateByUrl('/login') }); }
  logoutAll() { this.auth.logoutAll().subscribe({ next: () => this.router.navigateByUrl('/login') }); }
}

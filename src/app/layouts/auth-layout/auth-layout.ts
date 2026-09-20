import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [IonContent, RouterOutlet],
  template: ` <ion-content fullscreen>
    <router-outlet />
  </ion-content>`,
})
export class AuthLayoutComponent {}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonList,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  moonOutline,
  sunnyOutline,
  logOutOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { fa } from '../../core/i18n/fa';
import { UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonList,
    UiButtonComponent,
  ],
  template: ` <ion-header
      ><ion-toolbar
        ><ion-title>{{ t.title }}</ion-title></ion-toolbar
      ></ion-header
    >
    <ion-content [fullscreen]="true">
      <div class="page-wrap">
        @if (auth.user(); as u) {
          <div class="hero">
            <h2>{{ u.name }} {{ u.family }}</h2>
            <p>@{{ u.username }} · {{ u.role }}</p>
          </div>
          <ion-card>
            <ion-card-header
              ><ion-card-title style="font-size:15px">{{
                t.title
              }}</ion-card-title></ion-card-header
            >
            <ion-card-content>
              <ion-list lines="none">
                <ion-item
                  ><ion-label
                    ><p class="muted">{{ t.username }}</p>
                    <h3>{{ u.username }}</h3></ion-label
                  ></ion-item
                >
                <ion-item
                  ><ion-label
                    ><p class="muted">{{ t.role }}</p>
                    <h3>{{ u.role }}</h3></ion-label
                  ></ion-item
                >
                <ion-item
                  ><ion-label
                    ><p class="muted">{{ t.phone }}</p>
                    <h3>{{ u.phoneNumber }}</h3></ion-label
                  ></ion-item
                >
                <ion-item
                  ><ion-label
                    ><p class="muted">{{ t.nationalCode }}</p>
                    <h3>{{ u.nationalCode }}</h3></ion-label
                  ></ion-item
                >
              </ion-list>
            </ion-card-content>
          </ion-card>
        } @else {
          <div class="empty-state">
            <p style="color:var(--ion-color-medium)">{{ t.notLoggedIn }}</p>
          </div>
        }
        <div class="section">
          <p class="section-title">{{ th.label }}</p>
          <div
            class="card-modern"
            style="display:flex;align-items:center;justify-content:space-between"
          >
            <span style="display:flex;align-items:center;gap:8px"
              ><ion-icon
                [name]="theme.isDark() ? 'moon-outline' : 'sunny-outline'"
              ></ion-icon>
              {{ theme.isDark() ? th.dark : th.light }}
              <span class="muted">· {{ t.themeHint }}</span></span
            >
            <ion-toggle
              [checked]="theme.isDark()"
              (ionChange)="theme.toggle()"
              aria-label="theme toggle"
            ></ion-toggle>
          </div>
        </div>
        <div class="section" style="display:grid;gap:10px">
          <app-ui-button
            color="danger"
            icon="log-out-outline"
            (pressed)="logout()"
            >{{ t.logout }}</app-ui-button
          >
          <app-ui-button
            fill="outline"
            color="danger"
            icon="phone-portrait-outline"
            (pressed)="logoutAll()"
            >{{ t.logoutAll }}</app-ui-button
          >
        </div>
      </div>
    </ion-content>`,
})
export class ProfilePage {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private router = inject(Router);
  t = fa.profile;
  th = fa.theme;
  c = fa.common;
  constructor() {
    addIcons({
      moonOutline,
      sunnyOutline,
      logOutOutline,
      phonePortraitOutline,
    });
  }
  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
  logoutAll() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
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
import { moonOutline, sunnyOutline, logOutOutline, phonePortraitOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { fa } from '../../core/i18n/fa';
import { UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonToggle, IonIcon, IonList, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap" dir="rtl">
        @if (auth.user(); as u) {
          <div class="dark-card" style="padding:18px;display:flex;gap:12px;align-items:center">
            <div style="width:48px;height:48px;border-radius:12px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:var(--accent-contrast);font-weight:800">{{ u.name[0] }}</div>
            <div style="text-align:right">
              <h2 style="margin:0;font-size:15px;font-weight:800;color:var(--text-primary)">{{ u.name }} {{ u.family }}</h2>
              <p style="margin:4px 0 0;color:var(--text-secondary);font-size:11px">@{{ u.username }} · {{ u.role }}</p>
            </div>
          </div>
          <ion-card style="margin-top:12px">
            <ion-card-header><ion-card-title style="font-size:13px;color:var(--text-primary)">{{ t.title }}</ion-card-title></ion-card-header>
            <ion-card-content>
              <ion-list lines="none" style="background:transparent">
                <ion-item><ion-label><p class="muted">{{ t.username }}</p><h3 style="color:var(--text-primary);font-size:13px">{{ u.username }}</h3></ion-label></ion-item>
                <ion-item><ion-label><p class="muted">{{ t.role }}</p><h3 style="color:var(--text-primary);font-size:13px">{{ u.role }}</h3></ion-label></ion-item>
                <ion-item><ion-label><p class="muted">{{ t.phone }}</p><h3 style="color:var(--text-primary);font-size:13px">{{ u.phoneNumber }}</h3></ion-label></ion-item>
                <ion-item><ion-label><p class="muted">{{ t.nationalCode }}</p><h3 style="color:var(--text-primary);font-size:13px">{{ u.nationalCode }}</h3></ion-label></ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>
        } @else {
          <div class="empty-state"><p style="color:var(--text-secondary)">{{ t.notLoggedIn }}</p></div>
        }
        <div class="section">
          <p class="section-title" style="color:var(--text-primary)">{{ th.label }}</p>
          <div class="dark-card" style="display:flex;align-items:center;justify-content:space-between">
            <span style="display:flex;align-items:center;gap:8px;color:var(--text-primary);font-size:12px"
              ><ion-icon [name]="theme.isDark() ? 'moon-outline' : 'sunny-outline'"></ion-icon> {{ theme.isDark() ? th.dark : th.light }} <span class="muted">· {{ t.themeHint }}</span></span
            >
            <ion-toggle [checked]="theme.isDark()" (ionChange)="theme.toggle()" aria-label="theme toggle"></ion-toggle>
          </div>
        </div>
        <div class="section" style="display:grid;gap:10px">
          <app-ui-button color="danger" icon="log-out-outline" (pressed)="logout()">{{ t.logout }}</app-ui-button>
          <app-ui-button fill="outline" color="danger" icon="phone-portrait-outline" (pressed)="logoutAll()">{{ t.logoutAll }}</app-ui-button>
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
  constructor() { addIcons({ moonOutline, sunnyOutline, logOutOutline, phonePortraitOutline }); }
  logout() { this.auth.logout().subscribe({ next: () => this.router.navigateByUrl('/login'), error: () => this.router.navigateByUrl('/login') }); }
  logoutAll() { this.auth.logoutAll().subscribe({ next: () => this.router.navigateByUrl('/login'), error: () => this.router.navigateByUrl('/login') }); }
}

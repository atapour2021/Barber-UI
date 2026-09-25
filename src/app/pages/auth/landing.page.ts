import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cutOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, RouterLink, ThemeToggleComponent],
  template: `
    <ion-content [fullscreen]="true" class="ion-padding landing-container">
      <div class="landing-topbar" dir="rtl">
        <span></span>
        <a class="topbar-brand" routerLink="/landing" aria-label="home">
          <span class="brand-icon"><ion-icon name="cut-outline"></ion-icon></span>
          <span class="brand-text"><b>نیوباربر</b></span>
        </a>
        <app-theme-toggle />
      </div>
      <div class="main-wrapper">
        <div class="image-wrapper">
          <img src="/assets/images/barber-reza.jpg" alt="Barber" />
        </div>
        <div class="text-content">
          <p class="subtitle">{{ t.subtitle }}</p>
          <h1>{{ t.title1 }}<br />{{ t.title2 }}</h1>
          <p class="description">{{ t.description }}</p>
        </div>
        <div class="action-wrapper">
          <ion-button expand="block" class="cta-button" (click)="onStart()">
            {{ t.submit }}
            <ion-icon slot="end" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .landing-container {
        --background: var(--ion-background-color);
        --color: var(--ion-text-color);
      }
      .landing-topbar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 6px 0 14px;
      }
      .landing-topbar .topbar-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: inherit;
        justify-self: center;
      }
      .landing-topbar app-theme-toggle { justify-self: end; }
      .brand-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--accent);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-contrast);
        font-size: 16px;
      }
      .brand-text b { font-size: 12px; font-weight: 800; color: var(--text-primary); }
      .main-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
        text-align: right;
      }
      .image-wrapper {
        flex: 1;
        overflow: hidden;
        margin-bottom: 20px;
      }
      .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 20px;
      }
      .text-content {
        margin-bottom: 20px;
      }
      .subtitle {
        color: var(--ion-color-primary);
        margin: 0;
        font-size: 14px;
      }
      h1 {
        color: var(--ion-text-color);
        font-size: 32px;
        line-height: 1.2;
        margin: 10px 0;
      }
      .description {
        color: var(--ion-color-medium);
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 0;
      }
      .cta-button {
        --background: var(--ion-color-primary);
        --color: var(--ion-color-primary-contrast);
        --border-radius: 12px;
        font-weight: bold;
        height: 50px;
      }
    `,
  ],
})
export class LandingPage {
  private router = inject(Router);
  t = fa.auth.landing;
  constructor() {
    addIcons({ 'arrow-back-outline': arrowBackOutline, cutOutline });
  }
  onStart(): void {
    this.router.navigateByUrl('/login');
  }
}

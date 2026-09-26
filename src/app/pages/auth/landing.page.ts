import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cutOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-content [fullscreen]="true" class="landing-container">
      <div class="landing-shell" dir="rtl">
        <div class="landing-topbar">
          <a class="topbar-brand" routerLink="/landing" aria-label="home">
            <span class="brand-icon"><ion-icon name="cut-outline"></ion-icon></span>
            <span class="brand-text"><b>نیوباربر</b></span>
          </a>
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
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host { display: block; height: 100%; }
      .landing-container {
        --background: var(--ion-background-color);
        --color: var(--ion-text-color);
        --padding-start: 0;
        --padding-end: 0;
        --padding-top: 0;
        --padding-bottom: 0;
      }
      .landing-shell {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        min-height: 100dvh;
        padding: calc(12px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));
        box-sizing: border-box;
        width: 100%;
      }
      .landing-topbar {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 0 14px;
        flex-shrink: 0;
      }
      .landing-topbar .topbar-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: inherit;
      }
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
        min-height: 0;
        flex: 1;
        justify-content: space-between;
        text-align: right;
        gap: 16px;
        box-sizing: border-box;
        overflow: hidden;
      }
      .image-wrapper {
        flex: 1;
        min-height: 180px;
        overflow: hidden;
        margin-bottom: 16px;
        border-radius: 20px;
      }
      .image-wrapper img {
        width: 100%;
        height: 100%;
        min-height: 180px;
        object-fit: cover;
        border-radius: 20px;
        display: block;
      }
      .text-content {
        margin-bottom: 16px;
        overflow-wrap: break-word;
        min-width: 0;
      }
      .subtitle {
        color: var(--ion-color-primary);
        margin: 0;
        font-size: 14px;
      }
      h1 {
        color: var(--ion-text-color);
        font-size: clamp(26px, 7vw, 32px);
        line-height: 1.2;
        margin: 10px 0;
        overflow-wrap: break-word;
      }
      .description {
        color: var(--ion-color-medium);
        font-size: 15px;
        line-height: 1.5;
        margin-bottom: 0;
        overflow-wrap: break-word;
      }
      .action-wrapper { flex-shrink: 0; width: 100%; box-sizing: border-box; }
      .cta-button {
        --background: var(--ion-color-primary);
        --color: var(--ion-color-primary-contrast);
        --border-radius: 12px;
        font-weight: bold;
        height: 50px;
        width: 100%;
      }
      @media (max-width: 1024px) {
        .landing-shell { max-width: 600px; margin: 0 auto; }
      }
      @media (max-width: 768px) {
        .landing-shell { max-width: 500px; }
      }
      @media (max-width: 480px) {
        .landing-shell { padding-left: 16px; padding-right: 16px; }
        .image-wrapper { min-height: 150px; margin-bottom: 12px; }
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

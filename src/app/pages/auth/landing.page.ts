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
    <ion-content [fullscreen]="true" [scrollY]="false" class="landing-container">
      <div class="landing-bg" aria-hidden="true">
        <img src="/assets/images/barber-reza.jpg" alt="" loading="eager" decoding="async" />
      </div>
      <div class="landing-shell" dir="rtl">
        <div class="landing-topbar">
          <a class="topbar-brand" routerLink="/landing" aria-label="home">
            <span class="brand-icon"><ion-icon name="cut-outline"></ion-icon></span>
            <span class="brand-text"><b>نیوباربر</b></span>
          </a>
        </div>
        <div class="main-wrapper">
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
      :host { display: block; height: 100%; overflow: hidden; }
      .landing-container {
        --background: transparent;
        --color: #fff;
        --padding-start: 0;
        --padding-end: 0;
        --padding-top: 0;
        --padding-bottom: 0;
        --overflow: hidden;
        position: relative;
        background: #0b101e;
      }
      .landing-container::part(scroll) { overflow: hidden; }
      .landing-bg {
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
      }
      .landing-bg img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
      }
      .landing-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(11,16,30,0.55) 0%, rgba(11,16,30,0.18) 38%, rgba(11,16,30,0.72) 100%),
          linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 100%);
      }
      .landing-shell {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        height: 100dvh;
        overflow: hidden;
        padding: calc(12px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));
        box-sizing: border-box;
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
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
        color: #fff;
        text-shadow: 0 1px 10px rgba(0,0,0,0.45);
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
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }
      .brand-text b { font-size: 12px; font-weight: 800; color: #fff; }
      .main-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        justify-content: flex-end;
        text-align: right;
        gap: 16px;
        box-sizing: border-box;
        overflow: hidden;
        padding-bottom: 4px;
      }
      .text-content {
        flex-shrink: 0;
        overflow-wrap: break-word;
        min-width: 0;
        text-shadow: 0 2px 18px rgba(0,0,0,0.55);
      }
      .subtitle {
        color: var(--accent-strong);
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        text-shadow: 0 1px 12px rgba(0,0,0,0.5);
      }
      h1 {
        color: #fff;
        font-size: clamp(26px, 7vw, 32px);
        line-height: 1.2;
        margin: 10px 0;
        overflow-wrap: break-word;
      }
      .description {
        color: rgba(255,255,255,0.88);
        font-size: 15px;
        line-height: 1.6;
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
        --box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      }
      @media (min-width: 768px) {
        .landing-shell { max-width: 480px; padding-left: 20px; padding-right: 20px; }
        h1 { font-size: 34px; }
      }
      @media (max-height: 640px) {
        .main-wrapper { gap: 12px; }
        h1 { font-size: clamp(22px, 6vw, 28px); margin: 8px 0; }
        .description { font-size: 13px; }
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

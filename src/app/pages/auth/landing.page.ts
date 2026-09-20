import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon],
  template: `
    <ion-content
      [fullscreen]="true"
      class="ion-padding landing-container"
    >
      <div class="main-wrapper">

        <div class="image-wrapper">
          <img
            src="/assets/images/barber-reza.jpg"
            alt="Barber"
          />
        </div>

        <div class="text-content">
          <p class="subtitle">
            نئوباربر، همراه همیشگی شما
          </p>

          <h1>
            بهترین استایل،<br />
            در بهترین زمان
          </h1>

          <p class="description">
            آرایشگر مورد اعتماد خود را پیدا کنید و در چند قدم ساده نوبت بگیرید.
          </p>
        </div>

        <div class="action-wrapper">
          <ion-button
            expand="block"
            class="cta-button"
            (click)="onStart()"
          >
            شروع کنیم

            <ion-icon
              slot="end"
              name="arrow-back-outline"
            ></ion-icon>
          </ion-button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [
    `
      .landing-container {
        --background: #0a0a0c;
      }

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
        color: #ffb703;
        margin: 0;
        font-size: 14px;
      }

      h1 {
        color: #ffffff;
        font-size: 32px;
        line-height: 1.2;
        margin: 10px 0;
      }

      .description {
        color: #a0a0a0;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 0;
      }

      .cta-button {
        --background: #ffb703;
        --color: #000;
        --border-radius: 12px;
        font-weight: bold;
        height: 50px;
      }
    `,
  ],
})
export class LandingPage {
  private router = inject(Router);

  constructor() {
    addIcons({ 'arrow-back-outline': arrowBackOutline });
  }

  onStart(): void {
    this.router.navigateByUrl('/login');
  }
}
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cutOutline } from 'ionicons/icons';
import { filter } from 'rxjs';
import { fa } from '../../core/i18n/fa';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [IonContent, IonRouterOutlet, RouterLink, IonIcon, ThemeToggleComponent],
  template: `
    <ion-content [fullscreen]="true" class="login-content">
      <div class="login-wrapper" dir="rtl">
        <div class="auth-header">
          <a [routerLink]="backLink" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline" class="back-icon"></ion-icon></a>
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <app-theme-toggle class="auth-theme" />
        </div>
        <div class="auth-titles">
          <h1 class="title">{{ meta.title }}</h1>
          <p class="subtitle">{{ meta.subtitle }}</p>
        </div>
        <ion-router-outlet />
      </div>
    </ion-content>
  `,
})
export class AuthLayoutComponent {
  private router = inject(Router);
  url = this.router.url;
  constructor() {
    addIcons({ cutOutline, arrowForwardOutline });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.url = (e as NavigationEnd).urlAfterRedirects;
    });
  }
  get meta(): { title: string; subtitle: string } {
    if (this.url.includes('register')) return { title: fa.auth.register.title, subtitle: fa.auth.register.subtitle };
    if (this.url.includes('forgot')) return { title: fa.auth.forgot.title, subtitle: fa.auth.forgot.subtitle };
    if (this.url.includes('reset')) return { title: fa.auth.reset.title, subtitle: fa.auth.reset.subtitle };
    return { title: fa.auth.login.title, subtitle: fa.auth.login.subtitle };
  }
  get backLink(): string {
    if (this.url.includes('register') || this.url.includes('forgot') || this.url.includes('reset')) return '/login';
    return '/landing';
  }
}

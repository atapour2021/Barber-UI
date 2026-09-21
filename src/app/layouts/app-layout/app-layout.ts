import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonFooter, IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  cutOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  notificationsOutline,
  sunnyOutline,
  moonOutline,
  menuOutline,
} from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IonFooter,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
  template: `
    <div class="app-shell">
      <div class="app-topbar" dir="rtl">
        <div class="app-topbar-inner">
          <button class="topbar-icon" type="button" aria-label="menu">
            <ion-icon name="menu-outline"></ion-icon>
          </button>
          <div class="topbar-brand">
            <span class="brand-icon"><ion-icon name="cut-outline"></ion-icon></span>
            <span class="brand-text"><b>نیوباربر</b><small>پنل مشتری</small></span>
          </div>
          <div class="topbar-actions">
            <button class="topbar-icon" type="button" (click)="theme.toggle()">
              <ion-icon [name]="theme.isDark() ? 'sunny-outline' : 'moon-outline'"></ion-icon>
            </button>
            <a class="topbar-icon topbar-bell" routerLink="/tabs/notifications">
              <ion-icon name="notifications-outline"></ion-icon>
              @if (unread > 0) { <em class="bell-dot"></em> }
            </a>
          </div>
        </div>
      </div>
      <div class="app-outlet"><router-outlet /></div>
      <ion-footer class="app-footer">
        <ion-tab-bar class="neo-tabbar">
          <ion-tab-button routerLink="/tabs/home" routerLinkActive="tab-selected">
            <ion-icon name="home-outline"></ion-icon>
            <ion-label>{{ t.home }}</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/services" routerLinkActive="tab-selected">
            <ion-icon name="cut-outline"></ion-icon>
            <ion-label>{{ t.services }}</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/appointments" routerLinkActive="tab-selected">
            <ion-icon name="calendar-outline"></ion-icon>
            <ion-label>{{ t.booking }}</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/appointments" routerLinkActive="tab-selected">
            <ion-icon name="time-outline"></ion-icon>
            <ion-label>{{ t.appointments }}</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/profile" routerLinkActive="tab-selected">
            <ion-icon name="person-outline"></ion-icon>
            <ion-label>{{ t.account }}</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-footer>
    </div>
  `,
  styles: [`
    .app-shell { display:flex; flex-direction:column; height:100%; background:var(--app-bg); }
    .app-outlet { flex:1; min-height:0; display:flex; flex-direction:column; background:var(--app-bg); }
    .app-outlet router-outlet + * { flex:1; display:flex; flex-direction:column; }
    .app-footer ion-tab-bar { height:64px; padding-bottom:env(safe-area-inset-bottom); }
  `],
})
export class AppLayoutComponent {
  t = fa.nav;
  theme = inject(ThemeService);
  private api = inject(ApiService);
  unread = 0;
  constructor() {
    addIcons({ homeOutline, cutOutline, calendarOutline, timeOutline, personOutline, notificationsOutline, sunnyOutline, moonOutline, menuOutline });
    this.api.notifications.unread().subscribe({
      next: (v) => {
        const n = typeof v === 'number' ? v : ((v as { count: number }).count ?? 0);
        this.unread = n;
      },
      error: () => {},
    });
  }
}

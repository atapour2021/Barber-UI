import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonFooter, IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, calendar, notifications, person } from 'ionicons/icons';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IonFooter, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <div class="app-shell">
      <div class="app-outlet"><router-outlet /></div>
      <ion-footer class="app-footer">
        <ion-tab-bar>
          <ion-tab-button routerLink="/tabs/home" routerLinkActive="tab-selected" [routerLinkActiveOptions]="{ exact: false }">
            <ion-icon name="home"></ion-icon>
            <ion-label>خانه</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/appointments" routerLinkActive="tab-selected">
            <ion-icon name="calendar"></ion-icon>
            <ion-label>نوبت‌ها</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/notifications" routerLinkActive="tab-selected">
            <ion-icon name="notifications"></ion-icon>
            <ion-label>اعلان‌ها</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/profile" routerLinkActive="tab-selected">
            <ion-icon name="person"></ion-icon>
            <ion-label>پروفایل</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-footer>
    </div>`,
  styles: [`
  .app-shell{display:flex;flex-direction:column;height:100%}
  .app-outlet{flex:1;min-height:0;display:flex;flex-direction:column}
  .app-outlet router-outlet + *{flex:1;display:flex;flex-direction:column}
  .app-footer ion-tab-bar{--background:#fff;border-top:1px solid #e5e7eb;height:64px;padding-bottom:env(safe-area-inset-bottom)}
  ion-tab-button{--color:var(--ion-color-medium);--color-selected:var(--ion-color-primary);font-size:11px}
  ion-tab-button ion-icon{font-size:20px;margin-bottom:2px}
  `],
})
export class AppLayoutComponent {
  constructor() { addIcons({ home, calendar, notifications, person }); }
}

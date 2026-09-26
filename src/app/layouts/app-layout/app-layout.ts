import { Component, HostListener, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonFooter, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  cutOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  notificationsOutline,
  menuOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ViewRoleService } from '../../core/services/view-role.service';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar';
@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonRouterOutlet,
    IonFooter,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    AppSidebarComponent,
  ],
  template: `
    <div class="app-shell">
      <div class="app-topbar" dir="rtl">
        <div class="app-topbar-inner">
          <div class="topbar-leading">
            <button class="topbar-icon" type="button" aria-label="menu" (click)="toggleSidebar()">
              <ion-icon name="menu-outline"></ion-icon>
            </button>
            @if (showBack) {
              <button class="topbar-icon" type="button" aria-label="back" (click)="goBack()">
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </button>
            }
          </div>
          <a class="topbar-brand topbar-center" routerLink="/tabs/home" aria-label="home">
            <span class="brand-icon"><ion-icon name="cut-outline"></ion-icon></span>
            <span class="brand-text"><b>نیوباربر</b><small>{{ activeView() === 'barber' ? 'پنل آرایشگر' : activeView() === 'admin' ? 'پنل مدیریت' : 'پنل مشتری' }}</small></span>
          </a>
          <div class="topbar-actions">
            <a class="topbar-icon topbar-bell" routerLink="/tabs/notifications" aria-label="notifications">
              <ion-icon name="notifications-outline"></ion-icon>
              @if (unread > 0) { <em class="bell-dot"></em> }
            </a>
          </div>
        </div>
      </div>
      <app-sidebar [open]="sidebarOpen()" [activeView]="activeView()" (closed)="closeSidebar()" (viewChange)="setView($event)" (logoutClicked)="logout()" />
      <div class="app-outlet"><ion-router-outlet /></div>
      <ion-footer class="app-footer">
        <ion-tab-bar class="neo-tabbar">
          <ion-tab-button routerLink="/tabs/home" routerLinkActive="tab-selected">
            <ion-icon name="home-outline"></ion-icon>
            <ion-label>{{ t.home }}</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/services" routerLinkActive="tab-selected">
            <ion-icon name="cut-outline"></ion-icon>
            <ion-label>{{ t.services }}</ion-label>
          </ion-tab-button>
          <ion-tab-button routerLink="/tabs/booking" routerLinkActive="tab-selected">
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
    .app-shell { display:flex; flex-direction:column; min-height:100dvh; background:var(--app-bg); }
    .app-outlet { flex:1; display:block; min-width:0; background:var(--app-bg); }
    :host ::ng-deep ion-content { --padding-bottom: calc(64px + env(safe-area-inset-bottom) + 16px); }
    .app-footer { position:sticky; bottom:0; z-index:10; }
    .app-footer ion-tab-bar { height:64px; padding-bottom:env(safe-area-inset-bottom); }
  `],
})
export class AppLayoutComponent {
  t = fa.nav;
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);
  unread = 0;
  sidebarOpen = signal(false);
  showBack = false;
  private viewRole = inject(ViewRoleService);
  activeView = this.viewRole.activeView;
  private noBack = new Set(['/tabs/home','/tabs/services','/tabs/booking','/tabs/appointment','/tabs/profile','/barbershops','/barbers','/services','/appointments','/notifications','/profile','/admin','/training']);

  constructor() {
    addIcons({ homeOutline, cutOutline, calendarOutline, timeOutline, personOutline, notificationsOutline, chevronForwardOutline, menuOutline });
    this.api.notifications.unread().subscribe({
      next: (v) => {
        const n = typeof v === 'number' ? v : ((v as { count: number }).count ?? 0);
        this.unread = n;
      },
      error: () => {},
    });
    this.updateBack(this.router.url);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.updateBack(e.urlAfterRedirects);
    });
  }

  private updateBack(url: string) {
    const path = url.split('?')[0].split('#')[0];
    this.showBack = !this.noBack.has(path) && path !== '/' && path !== '';
  }

  goBack() {
    if (window.history.length > 1) this.location.back();
    else this.router.navigateByUrl('/tabs/home');
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }
  setView(v: 'admin' | 'barber' | 'customer') { this.viewRole.setView(v); }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeSidebar(); }

  logout() {
    this.closeSidebar();
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => {
        this.auth.clear();
        this.router.navigateByUrl('/login');
      },
    });
  }
}

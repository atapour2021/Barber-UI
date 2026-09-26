import { Component, HostListener, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, homeOutline, cutOutline, calendarOutline, timeOutline, personOutline, person, notificationsOutline, menuOutline, appsOutline, schoolOutline, chevronForwardOutline } from 'ionicons/icons';
import { fa } from '../core/i18n/fa';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { ApiService } from '../core/services/api.service';
import { ViewRoleService } from '../core/services/view-role.service';
import { AppSidebarComponent } from '../shared/components/app-sidebar/app-sidebar';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [RouterLink, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, AppSidebarComponent],
})
export class TabsPage {
  t = fa.nav;
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private api = inject(ApiService);
  private router = inject(Router);
  private location = inject(Location);
  unread = 0;
  sidebarOpen = signal(false);
  showBack = false;
  private viewRole = inject(ViewRoleService);
  activeView = this.viewRole.activeView;
  private noBack = new Set(['/tabs/home','/tabs/services','/tabs/booking','/tabs/appointment','/tabs/profile','/tabs/training']);
  constructor() {
    addIcons({ home, homeOutline, cutOutline, calendarOutline, timeOutline, personOutline, person, notificationsOutline, menuOutline, appsOutline, schoolOutline, chevronForwardOutline });
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
    this.showBack = !this.noBack.has(path) && path !== '/tabs' && path !== '/';
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
      error: () => { this.auth.clear(); this.router.navigateByUrl('/login'); },
    });
  }
}

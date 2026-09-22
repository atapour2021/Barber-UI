import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  home,
  homeOutline,
  cutOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  person,
  notificationsOutline,
  sunnyOutline,
  moonOutline,
  menuOutline,
  appsOutline,
  schoolOutline,
} from 'ionicons/icons';
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
  unread = 0;
  sidebarOpen = signal(false);
  private viewRole = inject(ViewRoleService);
  activeView = this.viewRole.activeView;
  constructor() {
    addIcons({
      home,
      homeOutline,
      cutOutline,
      calendarOutline,
      timeOutline,
      personOutline,
      person,
      notificationsOutline,
      sunnyOutline,
      moonOutline,
      menuOutline,
      appsOutline,
      schoolOutline,
    });
    this.api.notifications.unread().subscribe({
      next: (v) => {
        const n = typeof v === 'number' ? v : ((v as { count: number }).count ?? 0);
        this.unread = n;
      },
      error: () => {},
    });
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

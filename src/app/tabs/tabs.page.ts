import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  locationOutline,
} from 'ionicons/icons';
import { fa } from '../core/i18n/fa';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [RouterLink, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  t = fa.nav;
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private api = inject(ApiService);
  unread = 0;
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
      locationOutline,
    });
    this.api.notifications.unread().subscribe({
      next: (v) => {
        const n = typeof v === 'number' ? v : ((v as { count: number }).count ?? 0);
        this.unread = n;
      },
      error: () => {},
    });
  }
}

import { Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, calendar, notifications, person } from 'ionicons/icons';
import { fa } from '../core/i18n/fa';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  t = fa.nav;
  constructor() {
    addIcons({ home, calendar, notifications, person });
  }
}

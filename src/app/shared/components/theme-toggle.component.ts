import { Component, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: `<ion-button fill="clear" size="small" (click)="theme.toggle()" [attr.aria-label]="t.toggle"><ion-icon slot="icon-only" [name]="theme.isDark() ? 'sunny-outline' : 'moon-outline'"></ion-icon></ion-button>`,
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
  t = fa.theme;
  constructor() { addIcons({ moonOutline, sunnyOutline }); }
}

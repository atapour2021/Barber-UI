import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IonIcon],
  template: `<button class="theme-toggle" type="button" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'حالت روشن' : 'حالت تیره'" [class.dark]="theme.isDark()">
    <span class="theme-toggle-track" aria-hidden="true">
      <span class="theme-toggle-knob"><ion-icon [name]="theme.isDark() ? 'moon-outline' : 'sunny-outline'"></ion-icon></span>
    </span>
  </button>`,
  styles: [`
    :host { display:inline-flex; }
    .theme-toggle { background:transparent; border:none; cursor:pointer; padding:2px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; }
    .theme-toggle-track { display:block; width:46px; height:26px; border-radius:999px; background:#9ca3b8; border:1px solid #9ca3b8; position:relative; transition: background .22s, border-color .22s; }
    .theme-toggle.dark .theme-toggle-track { background:var(--accent); border-color:var(--accent); }
    .theme-toggle-knob { position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:12px; color:#6b7280; box-shadow:0 1px 4px rgba(0,0,0,.2); transition: transform .22s cubic-bezier(0.32,0.72,0,1), background .22s, color .22s; }
    .theme-toggle.dark .theme-toggle-knob { transform:translateX(20px); background:#fff; color:#b45309; }
    .theme-toggle:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  `],
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
  constructor() {
    addIcons({ moonOutline, sunnyOutline });
  }
}

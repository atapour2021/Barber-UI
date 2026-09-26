import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, chevronBackOutline, shieldCheckmarkOutline, cutOutline, personOutline, locationOutline, playOutline, ribbonOutline, logOutOutline } from 'ionicons/icons';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from '../theme-toggle.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, IonIcon, ThemeToggleComponent],
  template: `
    @if (open()) {
      <div class="sidebar-backdrop" (click)="closed.emit()" aria-hidden="true"></div>
    }
    <aside class="sidebar" [class.open]="open()" dir="rtl" aria-label="منوی اصلی" [attr.aria-hidden]="!open()">
      <div class="sidebar-head">
        <span class="sidebar-title">منوی اصلی</span>
        <button class="sidebar-close" type="button" aria-label="close" (click)="closed.emit()">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      <nav class="sidebar-nav">
        <a class="sidebar-item" (click)="closed.emit()" routerLink="/barbershops">
          <span class="sidebar-item-label"><ion-icon name="location-outline"></ion-icon> موقعیت آرایشگاه</span>
          <ion-icon name="chevron-back-outline" class="sidebar-chevron"></ion-icon>
        </a>
        <a class="sidebar-item" (click)="closed.emit()" routerLink="/barbers">
          <span class="sidebar-item-label"><ion-icon name="play-outline"></ion-icon> ویدیوهای آموزشی</span>
          <ion-icon name="chevron-back-outline" class="sidebar-chevron"></ion-icon>
        </a>
        <a class="sidebar-item" (click)="closed.emit()" routerLink="/tabs/documents">
          <span class="sidebar-item-label"><ion-icon name="ribbon-outline"></ion-icon> مدارک و گواهی‌ها</span>
          <ion-icon name="chevron-back-outline" class="sidebar-chevron"></ion-icon>
        </a>
      </nav>
      <div class="sidebar-theme">
        <span class="sidebar-item-label">{{ theme.isDark() ? 'حالت تیره' : 'حالت روشن' }}</span>
        <app-theme-toggle />
      </div>
      <button class="sidebar-logout" type="button" (click)="logoutClicked.emit()">
        <ion-icon name="log-out-outline"></ion-icon><span>خروج از حساب</span>
      </button>
    </aside>
  `,
  styles: [`
    :host { display: contents; }
    .sidebar-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:29; animation: fadeIn 0.2s ease; }
    .sidebar { position:fixed; top:0; right:0; bottom:0; width:min(360px, 88vw); background:var(--card-bg); z-index:30; display:flex; flex-direction:column; padding:16px 14px calc(16px + env(safe-area-inset-bottom)); padding-top:calc(12px + env(safe-area-inset-top)); transform:translateX(100%); transition:transform 0.28s cubic-bezier(0.32,0.72,0,1); overflow-y:auto; border-left:1px solid var(--card-border); box-sizing:border-box; }
    .sidebar.open { transform:translateX(0); }
    .sidebar-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
    .sidebar-title { font-size:16px; font-weight:800; color:var(--text-primary); }
    .sidebar-close { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border:none; color:var(--text-secondary); font-size:20px; cursor:pointer; }
    .sidebar-subtitle { margin:0 0 10px; font-size:12px; color:var(--text-secondary); text-align:right; }
    .sidebar-roles { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:18px; }
    .role-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:12px 6px; border-radius:10px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-secondary); font-size:11px; font-weight:700; cursor:pointer; transition:all 0.15s; }
    .role-card ion-icon { font-size:18px; }
    .role-card.active { background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .sidebar-nav { display:flex; flex-direction:column; gap:2px; flex:1; }
    .sidebar-item { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:13px 4px; color:var(--text-primary); text-decoration:none; font-size:13px; font-weight:600; cursor:pointer; border-radius:8px; }
    .sidebar-item-label { display:inline-flex; align-items:center; gap:8px; }
    .sidebar-item-label ion-icon { font-size:16px; color:var(--text-secondary); }
    .sidebar-chevron { font-size:14px; color:var(--text-muted); flex-shrink:0; }
    .sidebar-theme { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; padding:13px 4px; border-top:1px solid var(--card-border); color:var(--text-primary); font-size:13px; font-weight:600; margin-top:8px; }
    .sidebar-logout { margin-top:8px; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px; border-radius:10px; background:transparent; border:1px solid var(--card-border); color:var(--text-primary); font-size:13px; font-weight:600; cursor:pointer; }
    .sidebar-logout ion-icon { font-size:16px; transform:scaleX(-1); }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  `],
})
export class AppSidebarComponent {
  theme = inject(ThemeService);
  open = input.required<boolean>();
  activeView = input.required<'admin' | 'barber' | 'customer'>();
  closed = output<void>();
  viewChange = output<'admin' | 'barber' | 'customer'>();
  logoutClicked = output<void>();
  constructor() {
    addIcons({ closeOutline, chevronBackOutline, shieldCheckmarkOutline, cutOutline, personOutline, locationOutline, playOutline, ribbonOutline, logOutOutline });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, notificationsOutline, locationOutline, chevronBackOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonContent, IonIcon, RouterLink],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap account-wrap" dir="rtl">
        <h1 class="account-title">پروفایل و تنظیمات</h1>

        <div class="account-profile">
          <img class="account-avatar" [src]="avatar()" (error)="onImgError($event)" alt="avatar" />
          <b class="account-name">{{ displayName() }}</b>
          <small class="account-phone" dir="ltr">{{ displayPhone() }}</small>
          <a class="account-edit" routerLink="/tabs/profile">ویرایش اطلاعات</a>
        </div>

        <div class="account-list">
          <div class="account-row">
            <span class="row-label"><ion-icon name="moon-outline"></ion-icon> حالت تاریک</span>
            <button type="button" class="toggle" [class.on]="theme.isDark()" (click)="theme.toggle()" role="switch" [attr.aria-checked]="theme.isDark()" aria-label="dark mode">
              <em></em>
            </button>
          </div>

          <div class="account-row">
            <span class="row-label"><ion-icon name="notifications-outline"></ion-icon> یادآوری پیامکی</span>
            <button type="button" class="toggle" [class.on]="smsEnabled()" (click)="toggleSms()" role="switch" [attr.aria-checked]="smsEnabled()" aria-label="sms reminder">
              <em></em>
            </button>
          </div>

          <a class="account-row account-link" routerLink="/tabs/addresses">
            <span class="row-label"><ion-icon name="location-outline"></ion-icon> آدرس‌ها</span>
            <ion-icon name="chevron-back-outline" class="row-chevron"></ion-icon>
          </a>

          <button type="button" class="account-row account-logout" (click)="logout()">خروج از حساب</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .account-wrap { max-width: 520px; gap: 18px; padding-top: 18px; }
    .account-title { margin: 0; font-size: 20px; font-weight: 800; color: var(--text-primary); text-align: right; }
    .account-profile { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 0 6px; }
    .account-avatar { width: 84px; height: 84px; border-radius: 12px; object-fit: cover; background: #1e2a44; }
    .account-name { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
    .account-phone { font-size: 11px; color: var(--text-secondary); letter-spacing: 0.3px; }
    .account-edit { font-size: 11px; font-weight: 700; color: var(--accent); text-decoration: none; cursor: pointer; margin-top: 2px; }
    .account-list { display: grid; gap: 10px; width: 100%; margin-top: 8px; }
    .account-row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px;
      padding: 12px 14px; min-height: 48px; box-sizing: border-box; width: 100%;
      color: var(--text-primary); font-size: 12px; font-weight: 600; text-decoration: none;
    }
    .row-label { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; }
    .row-label ion-icon { font-size: 16px; color: var(--text-primary); }
    .row-chevron { font-size: 14px; color: var(--text-secondary); flex-shrink: 0; }
    .account-link { cursor: pointer; }
    .account-logout {
      justify-content: center; background: transparent; border-color: var(--card-border);
      font-weight: 700; cursor: pointer; font-family: inherit;
    }
    .toggle {
      width: 42px; height: 24px; border-radius: 999px; background: #0f1a2e; border: 1px solid #243150;
      position: relative; cursor: pointer; padding: 0; flex-shrink: 0; transition: background 0.18s, border-color 0.18s;
    }
    .toggle em {
      position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 999px;
      background: #0b1220; transition: transform 0.18s, background 0.18s; display: block;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }
    .toggle.on { background: var(--accent); border-color: var(--accent); }
    .toggle.on em { transform: translateX(-16px); background: #fff; }
    @media (min-width: 640px) { .account-wrap { padding-top: 22px; gap: 20px; } .account-title { font-size: 22px; } }
  `],
})
export class ProfilePage {
  private auth = inject(AuthService);
  theme = inject(ThemeService);
  private router = inject(Router);
  smsEnabled = signal(this.readSms());

  displayName = computed(() => {
    const u = this.auth.user();
    if (u?.name && u?.family) return `${u.name} ${u.family}`;
    if (u?.name) return u.name;
    if (u?.username) return u.username;
    return 'امیر محمدی';
  });

  displayPhone = computed(() => {
    const u = this.auth.user();
    if (u?.phoneNumber) return this.toFaDigits(u.phoneNumber);
    return '۰۹۱۲ ۱۳۰ ۴۵۶۷';
  });

  avatar = computed(() => {
    const u = this.auth.user();
    const img = u?.profileImage as string | null | undefined;
    if (img) return img;
    return 'https://i.pravatar.cc/150?u=amir';
  });

  constructor() {
    addIcons({ moonOutline, notificationsOutline, locationOutline, chevronBackOutline });
  }

  toggleSms() {
    const v = !this.smsEnabled();
    this.smsEnabled.set(v);
    try { localStorage.setItem('sms_reminder', v ? '1' : '0'); } catch {}
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => {
        this.auth.clear();
        this.router.navigateByUrl('/login');
      },
    });
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=fallback';
  }

  private readSms(): boolean {
    try { return localStorage.getItem('sms_reminder') !== '0'; } catch { return true; }
  }

  private toFaDigits(s: string): string {
    const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return s.replace(/\d/g, d => fa[Number(d)]);
  }
}

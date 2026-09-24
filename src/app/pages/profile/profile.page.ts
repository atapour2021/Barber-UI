import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, notificationsOutline, locationOutline, chevronBackOutline, cameraOutline, createOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, RouterLink],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap account-wrap" dir="rtl">
        <h1 class="account-title">پروفایل و تنظیمات</h1>

        <div class="account-profile">
          <div class="avatar-wrap">
            <img class="account-avatar" [src]="avatar()" (error)="onImgError($event)" alt="avatar" />
            <label class="avatar-upload" [class.busy]="uploading()">
              @if (uploading()) { <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner> }
              @else { <ion-icon name="camera-outline"></ion-icon> }
              <input type="file" accept="image/*" (change)="onAvatarPicked($event)" [disabled]="uploading()" hidden />
            </label>
          </div>
          <b class="account-name">{{ displayName() }}</b>
          <small class="account-phone" dir="ltr">{{ displayPhone() }}</small>
          <a class="account-edit" routerLink="/tabs/profile/edit"><ion-icon name="create-outline" style="font-size:12px"></ion-icon> ویرایش اطلاعات</a>
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

          <a class="account-row account-link" routerLink="/tabs/profile/change-password">
            <span class="row-label"><ion-icon name="lock-closed-outline"></ion-icon> تغییر رمز عبور</span>
            <ion-icon name="chevron-back-outline" class="row-chevron"></ion-icon>
          </a>

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
    .avatar-wrap { position: relative; width: 84px; height: 84px; }
    .account-avatar { width: 84px; height: 84px; border-radius: 12px; object-fit: cover; background: #1e2a44; display:block; }
    .avatar-upload { position:absolute; bottom:-6px; left:-6px; width:30px; height:30px; border-radius:999px; background:var(--accent); color:var(--accent-contrast); display:inline-flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; border:2px solid var(--card-bg); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
    .avatar-upload.busy { cursor:default; opacity:0.9; }
    .account-name { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
    .account-phone { font-size: 11px; color: var(--text-secondary); letter-spacing: 0.3px; }
    .account-edit { font-size: 11px; font-weight: 700; color: var(--accent); text-decoration: none; cursor: pointer; margin-top: 2px; display:inline-flex; align-items:center; gap:4px; }
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
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);
  theme = inject(ThemeService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  smsEnabled = signal(this.readSms());
  uploading = signal(false);

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
    if (img) return this.resolveImg(img);
    return 'https://i.pravatar.cc/150?u=amir';
  });

  constructor() {
    addIcons({ moonOutline, notificationsOutline, locationOutline, chevronBackOutline, cameraOutline, createOutline, lockClosedOutline });
  }

  ngOnInit() {
    this.api.users.preferences().subscribe({
      next: (p: any) => {
        if (typeof p?.smsReminder === 'boolean') {
          this.smsEnabled.set(p.smsReminder);
          try { localStorage.setItem('sms_reminder', p.smsReminder ? '1' : '0'); } catch {}
        }
      },
      error: () => {},
    });
  }

  isBarber = () => (this.auth.user()?.role ?? '').toLowerCase() === 'barber';

  onAvatarPicked(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toast.error('فقط تصویر مجاز است'); input.value=''; return; }
    if (file.size > 5*1024*1024) { this.toast.error('حجم تصویر باید کمتر از ۵ مگابایت باشد'); input.value=''; return; }
    const fd = new FormData();
    fd.set('file', file);
    this.uploading.set(true);
    const done = (url: string) => {
      this.uploading.set(false);
      if (url) this.patchLocalAvatar(url);
      this.toast.success('تصویر پروفایل به‌روزرسانی شد');
    };
    const fail = (err: any) => {
      this.uploading.set(false);
      const msg = err?.error?.message ?? err?.message ?? 'آپلود ممکن نشد';
      this.toast.error(Array.isArray(msg) ? msg.join('، ') : String(msg));
    };
    if (this.isBarber()) {
      this.api.barbers.uploadMyAvatar(fd).subscribe({
        next: (b: any) => {
          const url = (b?.profileImage as string) ?? '';
          const resolved = url || '';
          if (resolved) this.patchLocalAvatar(resolved);
          if (!resolved) this.reloadUserAvatar();
          else {
            this.api.users.updateMe({ profileImage: resolved }).subscribe({ next: () => {}, error: () => {} });
            done(resolved);
          }
          if (!resolved) done('');
        },
        error: (err) => {
          this.api.users.uploadAvatar(fd).subscribe({ next: (u: any) => done((u?.profileImage as string) ?? ''), error: fail });
        },
      });
    } else {
      this.api.users.uploadAvatar(fd).subscribe({ next: (u: any) => done((u?.profileImage as string) ?? ''), error: fail });
    }
    input.value='';
  }

  private reloadUserAvatar() {
    this.api.users.me().subscribe({ next: (u: any) => this.patchLocalAvatar(u?.profileImage ?? ''), error: () => this.uploading.set(false) });
  }

  private patchLocalAvatar(url: string) {
    try {
      const cur = this.auth.user();
      if (!cur) return;
      const merged: any = { ...cur, profileImage: url };
      localStorage.setItem('user', JSON.stringify(merged));
      this.auth.user.set(merged);
    } catch {}
  }

  private resolveImg(img: string): string {
    if (/^https?:\/\//i.test(img)) return img;
    if (img.startsWith('/uploads')) return `${environment.apiUrl}${img}`;
    if (img.startsWith('uploads/')) return `${environment.apiUrl}/${img}`;
    return img;
  }

  toggleSms() {
    const v = !this.smsEnabled();
    this.smsEnabled.set(v);
    try { localStorage.setItem('sms_reminder', v ? '1' : '0'); } catch {}
    this.api.users.updatePreferences({ smsReminder: v } as any).subscribe({ error: () => {} });
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

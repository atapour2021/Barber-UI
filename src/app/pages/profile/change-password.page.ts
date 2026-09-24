import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonInput, IonItem, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonIcon, IonInput, IonItem, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap cp-wrap" dir="rtl">
        <div class="cp-head">
          <a routerLink="/tabs/profile" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <h1>تغییر رمز عبور</h1>
        </div>
        <div class="dark-card cp-form">
          <div class="input-group">
            <label><ion-icon name="lock-closed-outline"></ion-icon> رمز جدید</label>
            <ion-item lines="none" class="custom-input"><ion-input [(ngModel)]="newPassword" type="password" placeholder="حداقل ۶ کاراکتر"></ion-input></ion-item>
          </div>
          <div class="input-group">
            <label><ion-icon name="lock-closed-outline"></ion-icon> تکرار رمز جدید</label>
            <ion-item lines="none" class="custom-input"><ion-input [(ngModel)]="confirmPassword" type="password" placeholder="تکرار رمز جدید"></ion-input></ion-item>
          </div>
          @if (error()) { <div class="alert-error">{{ error() }}</div> }
          @if (ok()) { <div class="alert-ok">{{ ok() }}</div> }
          <button type="button" class="cp-submit" (click)="submit()" [disabled]="saving()">
            @if (saving()) { <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner> } @else { تغییر رمز }
          </button>
          <a routerLink="/tabs/profile" class="cp-cancel">انصراف</a>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .cp-wrap { max-width: 520px; gap: 14px; padding-top: 14px; }
    .cp-head { display:flex; align-items:center; gap:10px; }
    .cp-head h1 { margin:0; font-size:18px; font-weight:800; color:var(--text-primary); flex:1; text-align:right; }
    .back-btn { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-primary); text-decoration:none; font-size:18px; }
    .cp-form { display:grid; gap:10px; }
    .cp-submit { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:10px; padding:12px 16px; font-family:inherit; font-size:13px; font-weight:800; cursor:pointer; width:100%; }
    .cp-submit:disabled { opacity:0.7; cursor:default; }
    .cp-cancel { display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:12px; text-decoration:none; padding:6px; }
  `],
})
export class ChangePasswordPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  newPassword = '';
  confirmPassword = '';
  saving = signal(false);
  error = signal('');
  ok = signal('');
  constructor() { addIcons({ arrowForwardOutline, lockClosedOutline }); }
  submit() {
    this.error.set(''); this.ok.set('');
    const np = this.newPassword.trim();
    const cp = this.confirmPassword.trim();
    if (!np || !cp) { const m='رمز جدید و تکرار آن الزامی است'; this.error.set(m); this.toast.warning(m); return; }
    if (np.length < 6 || cp.length < 6) { const m='رمز عبور حداقل ۶ کاراکتر'; this.error.set(m); this.toast.warning(m); return; }
    if (np !== cp) { const m='رمزها مطابقت ندارند'; this.error.set(m); this.toast.warning(m); return; }
    this.saving.set(true);
    this.auth.changePassword({ newPassword: np, confirmPassword: cp }).subscribe({
      next: () => {
        this.saving.set(false);
        this.ok.set('رمز با موفقیت تغییر کرد — لطفا دوباره وارد شوید');
        this.toast.success('رمز با موفقیت تغییر کرد');
        setTimeout(() => { this.auth.clear(); this.router.navigateByUrl('/login'); }, 800);
      },
      error: (e) => { this.saving.set(false); const m = extractMessage(e,'تغییر رمز ناموفق بود'); this.error.set(m); this.toast.error(m); },
    });
  }
}

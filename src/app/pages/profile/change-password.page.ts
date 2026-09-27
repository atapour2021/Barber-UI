import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';
import { fa } from '../../core/i18n/fa';
import { UiInputComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonIcon, UiInputComponent, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap cp-wrap" dir="rtl">
        <div class="cp-head">
          <a routerLink="/tabs/profile" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <h1>{{t.title}}</h1>
        </div>
        <div class="dark-card cp-form">
          <app-ui-input [label]="t.newPassword" [placeholder]="t.placeholder" [(ngModel)]="newPassword" type="password" [togglePassword]="true" icon="lock-closed-outline" />
          <app-ui-input [label]="t.confirmNewPassword" [placeholder]="t.confirmPlaceholder" [(ngModel)]="confirmPassword" type="password" [togglePassword]="true" icon="lock-closed-outline" />
          @if (error()) { <div class="alert-error">{{ error() }}</div> }
          @if (ok()) { <div class="alert-ok">{{ ok() }}</div> }
          <app-ui-button size="large" [loading]="saving()" (pressed)="submit()">{{t.submit}}</app-ui-button>
          <a routerLink="/tabs/profile" class="cp-cancel">{{t.cancel}}</a>
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
    .cp-cancel { display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:12px; text-decoration:none; padding:6px; }
  `],
})
export class ChangePasswordPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  t = fa.changePassword;
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
    if (!np || !cp) { const m=this.t.required; this.error.set(m); this.toast.warning(m); return; }
    if (np.length < 6 || cp.length < 6) { const m=this.t.tooShort; this.error.set(m); this.toast.warning(m); return; }
    if (np !== cp) { const m=this.t.mismatch; this.error.set(m); this.toast.warning(m); return; }
    this.saving.set(true);
    this.auth.changePassword({ newPassword: np, confirmPassword: cp }).subscribe({
      next: () => { this.saving.set(false); this.ok.set(this.t.success); this.toast.success(this.t.success); setTimeout(() => { this.auth.clear(); this.router.navigateByUrl('/login'); }, 800); },
      error: (e) => { this.saving.set(false); const m = extractMessage(e,this.t.failed); this.error.set(m); this.toast.error(m); },
    });
  }
}

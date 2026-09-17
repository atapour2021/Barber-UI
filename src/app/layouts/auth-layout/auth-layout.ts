import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [IonContent, RouterOutlet],
  template: `
  <ion-content fullscreen class="auth-bg">
    <div class="auth-wrap">
      <div class="auth-brand">
        <div class="auth-logo">✂</div>
        <h1>آرایشگاه</h1>
        <p>مدیریت نوبت‌ها — ورود سریع و امن</p>
      </div>
      <router-outlet />
      <p class="auth-foot">© آرایشگاه</p>
    </div>
  </ion-content>`,
  styles: [`
  .auth-bg{--background:#f3f4f6}
  .auth-wrap{max-width:420px;margin:0 auto;padding:24px 16px 20px;min-height:100%;display:flex;flex-direction:column;gap:14px}
  .auth-brand{text-align:center;padding:6px 0 2px}
  .auth-logo{width:56px;height:56px;margin:0 auto 10px;border-radius:16px;display:grid;place-items:center;background:var(--ion-color-primary);color:#fff;font-size:26px;box-shadow:0 8px 20px rgba(0,0,0,.12)}
  .auth-brand h1{margin:0;font-size:22px;font-weight:800;letter-spacing:.2px}
  .auth-brand p{margin:6px 0 0;color:var(--ion-color-medium);font-size:13px}
  .auth-foot{text-align:center;color:var(--ion-color-medium);font-size:11px;margin:8px 0 0}
  `],
})
export class AuthLayoutComponent {}

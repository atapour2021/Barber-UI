import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonInput, IonButton, IonSpinner, IonItem, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, IonInput, IonButton, IonSpinner, IonItem, IonIcon],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>فراموشی رمز عبور</h2>
        <p>ایمیل یا نام کاربری خود را وارد کنید تا توکن بازیابی دریافت کنید</p>
      </div>

      <div class="field">
        <label>ایمیل یا نام کاربری</label>
        <ion-item lines="none" class="input-wrap">
          <ion-icon [name]="val.includes('@') ? 'mail-outline' : 'person-outline'" slot="start"></ion-icon>
          <ion-input placeholder="example@mail.com یا نام کاربری" [(ngModel)]="val"></ion-input>
        </ion-item>
      </div>

      @if (msg) { <div [class]="ok ? 'alert-ok' : 'alert-error'">{{msg}}</div> }
      @if (token) {
        <div class="token-box">
          <p class="token-label">توکن بازیابی (حالت توسعه):</p>
          <p class="token-val">{{token}}</p>
        </div>
      }

      <ion-button expand="block" class="primary-btn" (click)="submit()" [disabled]="loading || !val">
        @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { ارسال لینک بازیابی }
      </ion-button>

      <div class="row-links">
        <a routerLink="/reset" class="link">توکن دارید؟ بازیابی کنید</a>
        <a routerLink="/login" class="link">بازگشت به ورود</a>
      </div>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:12px;line-height:1.6}
  .field{margin-bottom:12px}
  .field label{font-size:12px;color:var(--ion-color-medium);display:block;margin-bottom:6px}
  .input-wrap{--background:#fff;--border-radius:14px;--padding-start:10px;border:1px solid #e5e7eb;border-radius:14px}
  .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .alert-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .token-box{background:#fff;border:1px dashed #d1d5db;border-radius:12px;padding:10px;margin-bottom:10px}
  .token-label{margin:0 0 6px;color:var(--ion-color-medium);font-size:11px}
  .token-val{margin:0;word-break:break-all;font-family:monospace;font-size:11px;direction:ltr;text-align:left}
  .primary-btn{--border-radius:14px;height:48px;font-weight:700;margin-top:4px}
  .row-links{display:flex;justify-content:space-between;gap:10px;margin-top:14px}
  .link{font-size:12px;text-decoration:none;color:var(--ion-color-primary)}
  `],
})
export class ForgotPage {
  private auth = inject(AuthService);
  val=''; msg=''; token=''; ok=false; loading=false;
  constructor(){ addIcons({ mailOutline, personOutline }); }
  submit(){
    this.loading=true; this.msg=''; this.token='';
    const isEmail=this.val.includes('@');
    this.auth.forgot(isEmail ? { email:this.val.trim() } : { username:this.val.trim() }).subscribe({
      next:(r:unknown)=>{
        this.loading=false; this.ok=true;
        const x=r as Record<string,unknown>;
        this.token=(x['reset_token'] as string) ?? '';
        this.msg=this.token ? 'توکن بازیابی ایجاد شد (حالت توسعه)' : 'در صورت وجود حساب، توکن ارسال شد';
      },
      error:e=>{ this.loading=false; this.ok=false; this.msg=e.error?.message ?? 'ارسال ناموفق بود'; },
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonInput, IonButton, IonSpinner, IonIcon, IonItem, IonSelect, IonSelectOption } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonInput, IonButton, IonSpinner, IonIcon, IonItem, IonSelect, IonSelectOption],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>ایجاد حساب</h2>
        <p>اطلاعات خود را کامل کنید</p>
      </div>

      <div class="grid2">
        <div class="field"><label>نام</label><ion-item lines="none" class="input-wrap"><ion-input placeholder="مثلا علی" [(ngModel)]="dto.name"></ion-input></ion-item></div>
        <div class="field"><label>نام خانوادگی</label><ion-item lines="none" class="input-wrap"><ion-input placeholder="مثلا حسینی" [(ngModel)]="dto.family"></ion-input></ion-item></div>
      </div>

      <div class="field"><label>کد ملی (۱۰ رقم)</label><ion-item lines="none" class="input-wrap"><ion-input inputmode="numeric" maxlength="10" placeholder="۰۰۱۲۳۴۵۶۷۸۹" [(ngModel)]="dto.nationalCode"></ion-input></ion-item></div>
      <div class="field"><label>نام کاربری</label><ion-item lines="none" class="input-wrap"><ion-input placeholder="username" [(ngModel)]="dto.username" autocomplete="username"></ion-input></ion-item></div>

      <div class="field">
        <label>رمز عبور</label>
        <ion-item lines="none" class="input-wrap">
          <ion-input [type]="showPwd?'text':'password'" placeholder="حداقل ۶ کاراکتر" [(ngModel)]="dto.password" autocomplete="new-password"></ion-input>
          <ion-button slot="end" fill="clear" size="small" (click)="showPwd=!showPwd"><ion-icon [name]="showPwd ? 'eye-off-outline':'eye-outline'"></ion-icon></ion-button>
        </ion-item>
      </div>

      <div class="field"><label>شماره موبایل</label><ion-item lines="none" class="input-wrap"><ion-input inputmode="tel" placeholder="۰۹۱۲..." [(ngModel)]="dto.phoneNumber"></ion-input></ion-item></div>

      <div class="field">
        <label>نقش</label>
        <ion-item lines="none" class="input-wrap">
          <ion-select interface="popover" placeholder="انتخاب نقش" [(ngModel)]="dto.role">
            <ion-select-option value="customer">مشتری</ion-select-option>
            <ion-select-option value="barber">آرایشگر</ion-select-option>
            <ion-select-option value="user">کاربر</ion-select-option>
          </ion-select>
        </ion-item>
      </div>

      @if (err) { <div class="alert-error">{{err}}</div> }

      <ion-button expand="block" class="primary-btn" (click)="submit()" [disabled]="loading">
        @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { ثبت‌نام }
      </ion-button>
      <p class="muted-center">حساب دارید؟ <a routerLink="/login" class="link-strong">ورود</a></p>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:13px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .field{margin-bottom:12px}
  .field label{font-size:12px;color:var(--ion-color-medium);display:block;margin-bottom:6px}
  .input-wrap{--background:#fff;--border-radius:14px;--padding-start:10px;border:1px solid #e5e7eb;border-radius:14px}
  .link-strong{color:var(--ion-color-primary);text-decoration:none;font-weight:700}
  .muted-center{text-align:center;color:var(--ion-color-medium);font-size:13px;margin-top:12px}
  .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .primary-btn{--border-radius:14px;height:48px;font-weight:700;margin-top:4px}
  `],
})
export class RegisterPage {
  private auth = inject(AuthService); private router = inject(Router);
  dto: Record<string, unknown> = { role: 'customer', name:'', family:'', nationalCode:'', username:'', password:'', phoneNumber:'' };
  err=''; loading=false; showPwd=false;
  constructor(){ addIcons({ eyeOutline, eyeOffOutline }); }
  submit(){
    this.err='';
    const d=this.dto as Record<string,string>;
    if(!d['nationalCode'] || String(d['nationalCode']).length!==10){ this.err='کد ملی باید ۱۰ رقم باشد'; return; }
    if(!d['name'] || !d['family'] || !d['username'] || !d['password']){ this.err='همه فیلدهای ستاره‌دار را پر کنید'; return; }
    if(String(d['password']).length<6){ this.err='رمز عبور حداقل ۶ کاراکتر'; return; }
    this.loading=true;
    this.auth.register(this.dto).subscribe({
      next:()=>{ this.loading=false; this.router.navigateByUrl('/tabs/home'); },
      error:e=>{ this.loading=false; this.err=e.error?.message ?? 'ثبت‌نام ناموفق بود'; },
    });
  }
}

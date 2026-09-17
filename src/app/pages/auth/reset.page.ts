import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput, IonButton, IonSpinner, IonIcon, IonItem } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, keyOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule, IonInput, IonButton, IonSpinner, IonIcon, IonItem],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>بازنشانی رمز عبور</h2>
        <p>توکن دریافتی و رمز جدید را وارد کنید</p>
      </div>

      <div class="field">
        <label>توکن بازیابی</label>
        <ion-item lines="none" class="input-wrap">
          <ion-icon name="key-outline" slot="start"></ion-icon>
          <ion-input placeholder="توکن" [(ngModel)]="token"></ion-input>
        </ion-item>
      </div>

      <div class="field">
        <label>رمز جدید</label>
        <ion-item lines="none" class="input-wrap">
          <ion-input [type]="showPwd?'text':'password'" placeholder="حداقل ۶ کاراکتر" [(ngModel)]="pwd"></ion-input>
          <ion-button slot="end" fill="clear" size="small" (click)="showPwd=!showPwd"><ion-icon [name]="showPwd ? 'eye-off-outline':'eye-outline'"></ion-icon></ion-button>
        </ion-item>
      </div>

      @if (msg) { <div [class]="ok?'alert-ok':'alert-error'">{{msg}}</div> }

      <ion-button expand="block" class="primary-btn" (click)="submit()" [disabled]="loading || !token || !pwd">
        @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { تغییر رمز }
      </ion-button>
      <p class="hint">پس از موفقیت به صفحه ورود منتقل می‌شوید</p>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:13px}
  .field{margin-bottom:12px}
  .field label{font-size:12px;color:var(--ion-color-medium);display:block;margin-bottom:6px}
  .input-wrap{--background:#fff;--border-radius:14px;--padding-start:10px;border:1px solid #e5e7eb;border-radius:14px}
  .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .alert-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .primary-btn{--border-radius:14px;height:48px;font-weight:700;margin-top:4px}
  .hint{text-align:center;color:var(--ion-color-medium);font-size:11px;margin-top:10px}
  `],
})
export class ResetPage {
  private auth = inject(AuthService); private router = inject(Router);
  token=''; pwd=''; msg=''; ok=false; loading=false; showPwd=false;
  constructor(){ addIcons({ eyeOutline, eyeOffOutline, keyOutline }); }
  submit(){
    this.loading=true; this.msg='';
    this.auth.reset({ token:this.token.trim(), password:this.pwd }).subscribe({
      next:()=>{ this.loading=false; this.ok=true; this.msg='رمز با موفقیت تغییر کرد — در حال انتقال به ورود...'; setTimeout(()=>this.router.navigateByUrl('/login'),1200); },
      error:e=>{ this.loading=false; this.ok=false; this.msg=e.error?.message ?? 'بازنشانی ناموفق بود'; },
    });
  }
}

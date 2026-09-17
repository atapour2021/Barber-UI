import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonInput, IonButton, IonSpinner, IonItem, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, IonInput, IonButton, IonSpinner, IonItem, IonIcon],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>{{t.title}}</h2>
        <p>{{t.subtitle}}</p>
      </div>

      <div class="field">
        <label>{{t.label}}</label>
        <ion-item lines="none">
          <ion-icon [name]="val.includes('@') ? 'mail-outline' : 'person-outline'" slot="start"></ion-icon>
          <ion-input [placeholder]="t.placeholder" [(ngModel)]="val"></ion-input>
        </ion-item>
      </div>

      @if (msg) { <div [class]="ok ? 'alert-ok' : 'alert-error'">{{msg}}</div> }
      @if (token) {
        <div class="token-box">
          <p class="token-label">{{t.tokenLabel}}</p>
          <p class="token-val">{{token}}</p>
        </div>
      }

      <ion-button expand="block" class="primary-btn" (click)="submit()" [disabled]="loading || !val">
        @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { {{t.submit}} }
      </ion-button>

      <div class="row-links">
        <a routerLink="/reset" class="link">{{t.hasTokenLink}}</a>
        <a routerLink="/login" class="link">{{t.backToLogin}}</a>
      </div>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:12px;line-height:1.6}
  .field{margin-bottom:12px}
  .field label{font-size:12px;color:var(--ion-color-medium);display:block;margin-bottom:6px}
  .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .alert-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .token-box{border:1px dashed var(--ion-color-medium);border-radius:12px;padding:10px;margin-bottom:10px}
  .token-label{margin:0 0 6px;color:var(--ion-color-medium);font-size:11px}
  .token-val{margin:0;word-break:break-all;font-family:monospace;font-size:11px;direction:ltr;text-align:left}
  .primary-btn{--border-radius:14px;height:48px;font-weight:700;margin-top:4px}
  .row-links{display:flex;justify-content:space-between;gap:10px;margin-top:14px}
  .link{font-size:12px;text-decoration:none;color:var(--ion-color-primary)}
  `],
})
export class ForgotPage {
  private auth = inject(AuthService);
  t = fa.auth.forgot;
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
        this.msg=this.token ? this.t.successWithToken : this.t.successWithoutToken;
      },
      error:e=>{ this.loading=false; this.ok=false; this.msg=e.error?.message ?? this.t.errorFailed; },
    });
  }
}

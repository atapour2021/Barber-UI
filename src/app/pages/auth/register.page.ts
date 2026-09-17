import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonInput, IonButton, IonSpinner, IonIcon, IonItem, IonSelect, IonSelectOption } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonInput, IonButton, IonSpinner, IonIcon, IonItem, IonSelect, IonSelectOption],
  template: `
    <div class="auth-card">
      <div class="auth-head">
        <h2>{{t.title}}</h2>
        <p>{{t.subtitle}}</p>
      </div>

      <div class="grid2">
        <div class="field"><label>{{t.nameLabel}}</label><ion-item lines="none"><ion-input [placeholder]="t.namePlaceholder" [(ngModel)]="dto.name"></ion-input></ion-item></div>
        <div class="field"><label>{{t.familyLabel}}</label><ion-item lines="none"><ion-input [placeholder]="t.familyPlaceholder" [(ngModel)]="dto.family"></ion-input></ion-item></div>
      </div>

      <div class="field"><label>{{t.nationalCodeLabel}}</label><ion-item lines="none"><ion-input inputmode="numeric" maxlength="10" [placeholder]="t.nationalCodePlaceholder" [(ngModel)]="dto.nationalCode"></ion-input></ion-item></div>
      <div class="field"><label>{{t.usernameLabel}}</label><ion-item lines="none"><ion-input placeholder="username" [(ngModel)]="dto.username" autocomplete="username"></ion-input></ion-item></div>

      <div class="field">
        <label>{{t.passwordLabel}}</label>
        <ion-item lines="none">
          <ion-input [type]="showPwd?'text':'password'" [placeholder]="t.passwordPlaceholder" [(ngModel)]="dto.password" autocomplete="new-password"></ion-input>
          <ion-button slot="end" fill="clear" size="small" (click)="showPwd=!showPwd"><ion-icon [name]="showPwd ? 'eye-off-outline':'eye-outline'"></ion-icon></ion-button>
        </ion-item>
      </div>

      <div class="field"><label>{{t.phoneLabel}}</label><ion-item lines="none"><ion-input inputmode="tel" [placeholder]="t.phonePlaceholder" [(ngModel)]="dto.phoneNumber"></ion-input></ion-item></div>

      <div class="field">
        <label>{{t.roleLabel}}</label>
        <ion-item lines="none">
          <ion-select interface="popover" [placeholder]="t.rolePlaceholder" [(ngModel)]="dto.role">
            <ion-select-option value="customer">{{t.roleCustomer}}</ion-select-option>
            <ion-select-option value="barber">{{t.roleBarber}}</ion-select-option>
            <ion-select-option value="user">{{t.roleUser}}</ion-select-option>
          </ion-select>
        </ion-item>
      </div>

      @if (err) { <div class="alert-error">{{err}}</div> }

      <ion-button expand="block" class="primary-btn" (click)="submit()" [disabled]="loading">
        @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { {{t.submit}} }
      </ion-button>
      <p class="muted-center">{{t.hasAccount}} <a routerLink="/login" class="link-strong">{{t.loginLink}}</a></p>
    </div>`,
  styles: [`
  .auth-card{padding:2px 0 8px}
  .auth-head h2{margin:0;font-size:22px;font-weight:800}
  .auth-head p{margin:6px 0 14px;color:var(--ion-color-medium);font-size:13px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .field{margin-bottom:12px}
  .field label{font-size:12px;color:var(--ion-color-medium);display:block;margin-bottom:6px}
  .link-strong{color:var(--ion-color-primary);text-decoration:none;font-weight:700}
  .muted-center{text-align:center;color:var(--ion-color-medium);font-size:13px;margin-top:12px}
  .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:10px;font-size:12px;margin-bottom:10px}
  .primary-btn{--border-radius:14px;height:48px;font-weight:700;margin-top:4px}
  `],
})
export class RegisterPage {
  private auth = inject(AuthService); private router = inject(Router);
  t = fa.auth.register;
  dto: Record<string, unknown> = { role: 'customer', name:'', family:'', nationalCode:'', username:'', password:'', phoneNumber:'' };
  err=''; loading=false; showPwd=false;
  constructor(){ addIcons({ eyeOutline, eyeOffOutline }); }
  submit(){
    this.err='';
    const d=this.dto as Record<string,string>;
    if(!d['nationalCode'] || String(d['nationalCode']).length!==10){ this.err=this.t.errorNationalCode; return; }
    if(!d['name'] || !d['family'] || !d['username'] || !d['password']){ this.err=this.t.errorRequired; return; }
    if(String(d['password']).length<6){ this.err=this.t.errorPasswordLength; return; }
    this.loading=true;
    this.auth.register(this.dto).subscribe({
      next:()=>{ this.loading=false; this.router.navigateByUrl('/tabs/home'); },
      error:e=>{ this.loading=false; this.err=e.error?.message ?? this.t.errorFailed; },
    });
  }
}

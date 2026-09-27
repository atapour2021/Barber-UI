import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cutOutline } from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';
import { UiInputComponent, UiSelectComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonIcon, UiInputComponent, UiSelectComponent, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="auth-wrapper" dir="rtl">
        <div class="auth-header">
          <a routerLink="/login" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <div class="logo-box"><ion-icon name="cut-outline"></ion-icon></div>
          <span class="auth-header-spacer" aria-hidden="true"></span>
        </div>
        <div class="auth-titles"><h1 class="title">{{ t.title }}</h1><p class="subtitle">{{ t.subtitle }}</p></div>
        <div class="auth-form">
          <div class="grid2">
            <app-ui-input [label]="t.nameLabel" [placeholder]="t.namePlaceholder" [(ngModel)]="dto.name" />
            <app-ui-input [label]="t.familyLabel" [placeholder]="t.familyPlaceholder" [(ngModel)]="dto.family" />
          </div>
          <app-ui-input [label]="t.nationalCodeLabel" [placeholder]="t.nationalCodePlaceholder" [(ngModel)]="dto.nationalCode" inputmode="numeric" [maxlength]="10" [ltr]="true" />
          <app-ui-input [label]="t.usernameLabel" placeholder="username" [(ngModel)]="dto.username" autocomplete="username" [ltr]="true" />
          <app-ui-input [label]="t.passwordLabel" [placeholder]="t.passwordPlaceholder" [(ngModel)]="dto.password" type="password" [togglePassword]="true" autocomplete="new-password" />
          <app-ui-input [label]="t.phoneLabel" [placeholder]="t.phonePlaceholder" [(ngModel)]="dto.phoneNumber" inputmode="tel" [ltr]="true" />
          <app-ui-select [label]="t.roleLabel" [placeholder]="t.rolePlaceholder" [(ngModel)]="dto.role" [options]="roleOpts" />
          @if (err) { <div class="alert-error">{{ err }}</div> }
          <app-ui-button size="large" [loading]="loading" (pressed)="submit()">{{ t.submit }}</app-ui-button>
        </div>
        <p class="footer">{{ t.hasAccount }} <a routerLink="/login">{{ t.loginLink }}</a></p>
      </div>
    </ion-content>
  `,
  styles: [`:host { display:block; height:100%; } .alert-error { overflow-wrap:break-word; word-break:break-word; }`],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.register;
  dto: Record<string, unknown> = { role: 'customer', name: '', family: '', nationalCode: '', username: '', password: '', phoneNumber: '' };
  roleOpts = [{ value: 'customer', label: fa.auth.register.roleCustomer }, { value: 'barber', label: fa.auth.register.roleBarber }, { value: 'user', label: fa.auth.register.roleUser }];
  err = '';
  loading = false;
  constructor() { addIcons({ cutOutline, arrowForwardOutline }); }
  submit() {
    this.err = '';
    const d = this.dto as Record<string, string>;
    const warn = (m: string) => { this.err = m; this.toast.warning(m); };
    if (!d['nationalCode'] || String(d['nationalCode']).length !== 10) { warn(this.t.errorNationalCode); return; }
    if (!d['name'] || !d['family'] || !d['username'] || !d['password']) { warn(this.t.errorRequired); return; }
    if (String(d['password']).length < 6) { warn(this.t.errorPasswordLength); return; }
    this.loading = true;
    this.auth.register(this.dto).subscribe({
      next: () => { this.loading = false; this.toast.success(fa.common.success); this.theme.loadFromApi(); this.router.navigateByUrl('/tabs/home'); },
      error: (e) => { this.loading = false; const m = extractMessage(e, this.t.errorFailed); this.err = m; this.toast.error(m); },
    });
  }
}

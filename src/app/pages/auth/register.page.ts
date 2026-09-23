import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, IonItem, IonSelect, IonSelectOption } from '@ionic/angular';
import { fa } from '../../core/i18n/fa';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonItem, IonInput, IonSelect, IonSelectOption, IonButton],
  template: `
    <div class="auth-form">
      <div class="grid2">
        <div class="input-group">
          <label>{{ t.nameLabel }}</label>
          <ion-item lines="none" class="custom-input">
            <ion-input [placeholder]="t.namePlaceholder" [(ngModel)]="dto.name"></ion-input>
          </ion-item>
        </div>
        <div class="input-group">
          <label>{{ t.familyLabel }}</label>
          <ion-item lines="none" class="custom-input">
            <ion-input [placeholder]="t.familyPlaceholder" [(ngModel)]="dto.family"></ion-input>
          </ion-item>
        </div>
      </div>
      <div class="input-group">
        <label>{{ t.nationalCodeLabel }}</label>
        <ion-item lines="none" class="custom-input">
          <ion-input [placeholder]="t.nationalCodePlaceholder" [(ngModel)]="dto.nationalCode" inputmode="numeric" maxlength="10"></ion-input>
        </ion-item>
      </div>
      <div class="input-group">
        <label>{{ t.usernameLabel }}</label>
        <ion-item lines="none" class="custom-input">
          <ion-input placeholder="username" [(ngModel)]="dto.username" autocomplete="username"></ion-input>
        </ion-item>
      </div>
      <div class="input-group">
        <label>{{ t.passwordLabel }}</label>
        <ion-item lines="none" class="custom-input">
          <ion-input [placeholder]="t.passwordPlaceholder" [(ngModel)]="dto.password" type="password" autocomplete="new-password"></ion-input>
        </ion-item>
      </div>
      <div class="input-group">
        <label>{{ t.phoneLabel }}</label>
        <ion-item lines="none" class="custom-input">
          <ion-input [placeholder]="t.phonePlaceholder" [(ngModel)]="dto.phoneNumber" inputmode="tel"></ion-input>
        </ion-item>
      </div>
      <div class="input-group">
        <label>{{ t.roleLabel }}</label>
        <ion-item lines="none" class="custom-input">
          <ion-select [placeholder]="t.rolePlaceholder" [(ngModel)]="dto.role" interface="popover">
            @for (o of roleOpts; track o.value) {
              <ion-select-option [value]="o.value">{{ o.label }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
      </div>
      @if (err) {
        <div class="alert-error">{{ err }}</div>
      }
      <ion-button expand="block" class="submit-btn" [disabled]="loading" (click)="submit()">{{ t.submit }}</ion-button>
    </div>
    <p class="footer">
      {{ t.hasAccount }} <a routerLink="/login">{{ t.loginLink }}</a>
    </p>
  `,
})
export class RegisterPage {
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private router = inject(Router);
  private toast = inject(ToastService);
  t = fa.auth.register;
  dto: Record<string, unknown> = {
    role: 'customer',
    name: '',
    family: '',
    nationalCode: '',
    username: '',
    password: '',
    phoneNumber: '',
  };
  roleOpts = [
    { value: 'customer', label: fa.auth.register.roleCustomer },
    { value: 'barber', label: fa.auth.register.roleBarber },
    { value: 'user', label: fa.auth.register.roleUser },
  ];
  err = '';
  loading = false;
  submit() {
    this.err = '';
    const d = this.dto as Record<string, string>;
    const warn = (m: string) => {
      this.err = m;
      this.toast.warning(m);
    };
    if (!d['nationalCode'] || String(d['nationalCode']).length !== 10) {
      warn(this.t.errorNationalCode);
      return;
    }
    if (!d['name'] || !d['family'] || !d['username'] || !d['password']) {
      warn(this.t.errorRequired);
      return;
    }
    if (String(d['password']).length < 6) {
      warn(this.t.errorPasswordLength);
      return;
    }
    this.loading = true;
    this.auth.register(this.dto).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(fa.common.success);
        this.theme.loadFromApi();
        this.router.navigateByUrl('/tabs/home');
      },
      error: (e) => {
        this.loading = false;
        const m = extractMessage(e, this.t.errorFailed);
        this.err = m;
        this.toast.error(m);
      },
    });
  }
}

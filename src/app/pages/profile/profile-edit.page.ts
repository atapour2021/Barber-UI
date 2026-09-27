import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, saveOutline, personOutline, callOutline, mailOutline, createOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractMessage } from '../../core/utils/error';
import { fa } from '../../core/i18n/fa';
import { UiInputComponent, UiTextareaComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule, IonContent, IonIcon, IonSpinner, RouterLink, UiInputComponent, UiTextareaComponent, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap edit-wrap" dir="rtl">
        <div class="edit-head">
          <a routerLink="/tabs/profile" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <h1>{{t.title}}</h1>
        </div>
        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">{{t.loading}}</p></div>
        } @else {
          <div class="dark-card edit-form">
            <b style="font-size:12px;color:var(--text-primary)">{{t.userInfo}}</b>
            <div class="grid2">
              <app-ui-input [label]="t.name" [placeholder]="t.name" [(ngModel)]="form.name" />
              <app-ui-input [label]="t.family" [placeholder]="t.family" [(ngModel)]="form.family" />
            </div>
            <app-ui-input [label]="t.phone" placeholder="09123456789" [(ngModel)]="form.phoneNumber" type="tel" icon="call-outline" [ltr]="true" />
            <app-ui-input [label]="t.email" placeholder="email@example.com" [(ngModel)]="form.email" type="email" icon="mail-outline" [ltr]="true" />
          </div>
          @if (isBarber()) {
            <div class="dark-card edit-form">
              <b style="font-size:12px;color:var(--text-primary)"><ion-icon name="create-outline"></ion-icon> {{t.barberInfo}}</b>
              <app-ui-input [label]="t.displayName" [placeholder]="t.displayName" [(ngModel)]="barberForm.fullName" />
              <app-ui-textarea [label]="t.bio" [placeholder]="t.bioPlaceholder" [(ngModel)]="barberForm.bio" />
            </div>
          }
          @if (error()) { <div class="alert-error">{{ error() }}</div> }
          <app-ui-button size="large" icon="save-outline" [loading]="saving()" (pressed)="save()">{{t.saveChanges}}</app-ui-button>
          <a routerLink="/tabs/profile" class="edit-cancel">{{t.cancel}}</a>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .edit-wrap { max-width: 520px; gap: 14px; padding-top: 14px; }
    .edit-head { display:flex; align-items:center; gap:10px; }
    .edit-head h1 { margin:0; font-size:18px; font-weight:800; color:var(--text-primary); flex:1; text-align:right; }
    .back-btn { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-primary); text-decoration:none; font-size:18px; }
    .edit-form { display:grid; gap:10px; }
    .edit-cancel { display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:12px; text-decoration:none; padding:6px; }
  `],
})
export class ProfileEditPage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  t = fa.profileEdit;
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  isBarber = () => (this.auth.user()?.role ?? '').toLowerCase() === 'barber';
  form: Record<string, string> = { name: '', family: '', phoneNumber: '', email: '' };
  barberForm: Record<string, string> = { fullName: '', bio: '' };
  private barberExists = false;
  constructor() { addIcons({ arrowForwardOutline, saveOutline, personOutline, callOutline, mailOutline, createOutline }); }
  ngOnInit() {
    this.api.users.me().subscribe({
      next: (u: any) => { this.form.name = u.name ?? ''; this.form.family = u.family ?? ''; this.form.phoneNumber = u.phoneNumber ?? ''; this.form.email = u.email ?? ''; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    if (this.isBarber()) {
      this.api.barbers.me().subscribe({
        next: (b: any) => { this.barberExists = true; this.barberForm.fullName = b.fullName ?? ''; this.barberForm.bio = b.bio ?? ''; },
        error: () => { this.barberExists = false; },
      });
    }
  }
  save() {
    this.error.set('');
    const phone = this.form.phoneNumber.trim();
    if (phone && !/^09\d{9}$/.test(phone)) { const m=fa.toast.invalidPhone; this.error.set(m); this.toast.error(m); return; }
    if (this.form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) { const m=fa.toast.invalidEmail; this.error.set(m); this.toast.error(m); return; }
    this.saving.set(true);
    const dto: Record<string, unknown> = {};
    if (this.form.name.trim()) dto['name'] = this.form.name.trim();
    if (this.form.family.trim()) dto['family'] = this.form.family.trim();
    if (phone) dto['phoneNumber'] = phone;
    dto['email'] = this.form.email.trim() || null;
    this.api.users.updateMe(dto).subscribe({
      next: (u: any) => {
        try { const cur = this.auth.user(); const merged = { ...cur, ...u }; localStorage.setItem('user', JSON.stringify(merged)); this.auth.user.set(merged as never); } catch {}
        if (this.isBarber() && this.barberExists) {
          const bDto: Record<string, unknown> = {};
          if (this.barberForm.fullName.trim()) bDto['fullName'] = this.barberForm.fullName.trim();
          if (this.barberForm.bio !== undefined) bDto['bio'] = this.barberForm.bio.trim() || null;
          if (!Object.keys(bDto).length) { this.saving.set(false); this.toast.success(fa.toast.profileSaved); this.router.navigateByUrl('/tabs/profile'); return; }
          this.api.barbers.updateMe(bDto).subscribe({
            next: () => { this.saving.set(false); this.toast.success(fa.toast.profileSaved); this.router.navigateByUrl('/tabs/profile'); },
            error: (e) => { this.saving.set(false); const m = extractMessage(e,fa.toast.barberSaveFailed); this.error.set(m); this.toast.error(m); },
          });
        } else { this.saving.set(false); this.toast.success(fa.toast.profileSaved); this.router.navigateByUrl('/tabs/profile'); }
      },
      error: (e) => { this.saving.set(false); const m = extractMessage(e,fa.toast.profileSaveFailed); this.error.set(m); this.toast.error(m); },
    });
  }
}

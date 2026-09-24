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

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule, IonContent, IonIcon, IonSpinner, RouterLink],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap edit-wrap" dir="rtl">
        <div class="edit-head">
          <a routerLink="/tabs/profile" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <h1>ویرایش پروفایل</h1>
        </div>

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">در حال بارگذاری...</p></div>
        } @else {
          <div class="dark-card edit-form">
            <b style="font-size:12px;color:var(--text-primary)">اطلاعات کاربری</b>
            <div class="edit-grid">
              <label class="edit-field"><span>نام</span><input class="edit-input" [(ngModel)]="form.name" placeholder="نام" /></label>
              <label class="edit-field"><span>نام خانوادگی</span><input class="edit-input" [(ngModel)]="form.family" placeholder="نام خانوادگی" /></label>
            </div>
            <label class="edit-field"><span><ion-icon name="call-outline"></ion-icon> شماره موبایل</span><input class="edit-input" [(ngModel)]="form.phoneNumber" placeholder="09123456789" inputmode="tel" dir="ltr" style="text-align:left" /></label>
            <label class="edit-field"><span><ion-icon name="mail-outline"></ion-icon> ایمیل</span><input class="edit-input" [(ngModel)]="form.email" placeholder="email@example.com" inputmode="email" dir="ltr" style="text-align:left" /></label>
          </div>

          @if (isBarber()) {
            <div class="dark-card edit-form">
              <b style="font-size:12px;color:var(--text-primary)"><ion-icon name="create-outline"></ion-icon> اطلاعات آرایشگر</b>
              <label class="edit-field"><span>نام نمایشی</span><input class="edit-input" [(ngModel)]="barberForm.fullName" placeholder="نام کامل" /></label>
              <label class="edit-field"><span>درباره من</span><textarea class="edit-input edit-area" [(ngModel)]="barberForm.bio" placeholder="توضیح کوتاه" rows="3"></textarea></label>
            </div>
          }

          @if (error()) { <div class="alert-error">{{ error() }}</div> }

          <button type="button" class="edit-save" (click)="save()" [disabled]="saving()">
            @if (saving()) { <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner> } @else { <ion-icon name="save-outline"></ion-icon> }
            ذخیره تغییرات
          </button>
          <a routerLink="/tabs/profile" class="edit-cancel">انصراف</a>
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
    .edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    @media(max-width:400px){ .edit-grid{ grid-template-columns:1fr; } }
    .edit-field { display:flex; flex-direction:column; gap:6px; }
    .edit-field span { font-size:11px; color:var(--text-secondary); display:inline-flex; align-items:center; gap:6px; }
    .edit-field span ion-icon { font-size:14px; }
    .edit-input { width:100%; box-sizing:border-box; background:#0f1a2e; border:1px solid var(--card-border); border-radius:8px; padding:10px 12px; color:var(--text-primary); font-family:inherit; font-size:12px; outline:none; }
    .edit-input::placeholder { color:var(--text-muted); }
    .edit-input:focus { border-color:var(--accent); }
    .edit-area { resize: vertical; min-height: 72px; }
    html:not(.ion-palette-dark) .edit-input { background:#f8fafc; }
    .edit-save { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:10px; padding:12px 16px; font-family:inherit; font-size:13px; font-weight:800; cursor:pointer; width:100%; }
    .edit-save:disabled { opacity:0.7; cursor:default; }
    .edit-cancel { display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:12px; text-decoration:none; padding:6px; }
  `],
})
export class ProfileEditPage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
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
      next: (u: any) => {
        this.form.name = u.name ?? '';
        this.form.family = u.family ?? '';
        this.form.phoneNumber = u.phoneNumber ?? '';
        this.form.email = u.email ?? '';
        this.loading.set(false);
      },
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
    if (phone && !/^09\d{9}$/.test(phone)) { const m='شماره موبایل معتبر نیست (09xxxxxxxxx)'; this.error.set(m); this.toast.error(m); return; }
    if (this.form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) { const m='ایمیل معتبر نیست'; this.error.set(m); this.toast.error(m); return; }
    this.saving.set(true);
    const dto: Record<string, unknown> = {};
    if (this.form.name.trim()) dto['name'] = this.form.name.trim();
    if (this.form.family.trim()) dto['family'] = this.form.family.trim();
    if (phone) dto['phoneNumber'] = phone;
    dto['email'] = this.form.email.trim() || null;
    this.api.users.updateMe(dto).subscribe({
      next: (u: any) => {
        try {
          const cur = this.auth.user();
          const merged = { ...cur, ...u };
          localStorage.setItem('user', JSON.stringify(merged));
          this.auth.user.set(merged as never);
        } catch {}
        if (this.isBarber() && this.barberExists) {
          const bDto: Record<string, unknown> = {};
          if (this.barberForm.fullName.trim()) bDto['fullName'] = this.barberForm.fullName.trim();
          if (this.barberForm.bio !== undefined) bDto['bio'] = this.barberForm.bio.trim() || null;
          if (!Object.keys(bDto).length) { this.saving.set(false); this.toast.success('پروفایل ذخیره شد'); this.router.navigateByUrl('/tabs/profile'); return; }
          this.api.barbers.updateMe(bDto).subscribe({
            next: () => { this.saving.set(false); this.toast.success('پروفایل ذخیره شد'); this.router.navigateByUrl('/tabs/profile'); },
            error: (e) => { this.saving.set(false); const m = extractMessage(e,'ذخیره اطلاعات آرایشگر ممکن نشد'); this.error.set(m); this.toast.error(m); },
          });
        } else {
          this.saving.set(false);
          this.toast.success('پروفایل ذخیره شد');
          this.router.navigateByUrl('/tabs/profile');
        }
      },
      error: (e) => { this.saving.set(false); const m = extractMessage(e,'ذخیره پروفایل ممکن نشد'); this.error.set(m); this.toast.error(m); },
    });
  }
}

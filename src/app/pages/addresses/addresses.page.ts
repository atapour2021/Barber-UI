import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, locationOutline, trashOutline, addOutline } from 'ionicons/icons';

type Addr = { id: string; label: string; detail: string };

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [IonContent, IonIcon, RouterLink, FormsModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap addr-wrap" dir="rtl">
        <div class="addr-head">
          <a routerLink="/tabs/profile" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <h1>آدرس‌ها</h1>
        </div>

        <div class="addr-list">
          @for (a of items(); track a.id) {
            <div class="addr-card">
              <span class="addr-icon"><ion-icon name="location-outline"></ion-icon></span>
              <div class="addr-text">
                <b>{{ a.label }}</b>
                <small>{{ a.detail }}</small>
              </div>
              <button type="button" class="addr-del" (click)="remove(a.id)" aria-label="delete"><ion-icon name="trash-outline"></ion-icon></button>
            </div>
          }
          @if (!items().length) {
            <div class="dark-card" style="text-align:center;padding:18px"><p class="muted" style="margin:0">آدرسی ثبت نشده</p></div>
          }
        </div>

        <div class="dark-card addr-form">
          <b style="font-size:12px;color:var(--text-primary)">افزودن آدرس</b>
          <input class="addr-input" [(ngModel)]="label" placeholder="عنوان مثلا خانه" />
          <input class="addr-input" [(ngModel)]="detail" placeholder="آدرس کامل" />
          <button type="button" class="addr-add" (click)="add()"><ion-icon name="add-outline"></ion-icon> افزودن</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .addr-wrap { max-width: 520px; gap: 16px; padding-top: 14px; }
    .addr-head { display:flex; align-items:center; gap:10px; }
    .addr-head h1 { margin:0; font-size:18px; font-weight:800; color:var(--text-primary); flex:1; text-align:right; }
    .back-btn { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-primary); text-decoration:none; font-size:18px; }
    .addr-list { display:grid; gap:10px; width:100%; }
    .addr-card { display:flex; align-items:center; gap:10px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:12px 14px; }
    .addr-icon { width:36px; height:36px; border-radius:8px; background:#1e2a44; display:inline-flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:16px; flex-shrink:0; }
    .addr-text { flex:1; min-width:0; text-align:right; display:flex; flex-direction:column; gap:2px; }
    .addr-text b { font-size:12px; font-weight:800; color:var(--text-primary); }
    .addr-text small { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .addr-del { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border:none; color:var(--text-muted); font-size:16px; cursor:pointer; flex-shrink:0; }
    .addr-form { display:grid; gap:10px; }
    .addr-input { width:100%; box-sizing:border-box; background:#0f1a2e; border:1px solid var(--card-border); border-radius:8px; padding:10px 12px; color:var(--text-primary); font-family:inherit; font-size:12px; outline:none; }
    .addr-input::placeholder { color:var(--text-muted); }
    .addr-input:focus { border-color:var(--accent); }
    .addr-add { display:inline-flex; align-items:center; justify-content:center; gap:6px; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:8px; padding:10px 14px; font-family:inherit; font-size:12px; font-weight:800; cursor:pointer; }
  `],
})
export class AddressesPage {
  items = signal<Addr[]>(this.load());
  label = '';
  detail = '';

  constructor() { addIcons({ arrowForwardOutline, locationOutline, trashOutline, addOutline }); }

  add() {
    const l = this.label.trim();
    const d = this.detail.trim();
    if (!l || !d) return;
    const next = [...this.items(), { id: Date.now().toString(36), label: l, detail: d }];
    this.items.set(next);
    this.persist(next);
    this.label = '';
    this.detail = '';
  }

  remove(id: string) {
    const next = this.items().filter(a => a.id !== id);
    this.items.set(next);
    this.persist(next);
  }

  private load(): Addr[] {
    try {
      const v = localStorage.getItem('addresses');
      if (v) return JSON.parse(v);
    } catch {}
    return [{ id: '1', label: 'خانه', detail: 'تهران، خیابان ولیعصر' }];
  }

  private persist(v: Addr[]) {
    try { localStorage.setItem('addresses', JSON.stringify(v)); } catch {}
  }
}

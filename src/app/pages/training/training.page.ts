import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { play } from 'ionicons/icons';

type TrainingItem = { id: string; title: string; meta: string; duration: string; img: string };

const ITEMS: TrainingItem[] = [
  { id: '1', title: 'فید سایه‌ای از صفر', meta: 'آکادمی نیوباربر · سطح پیشرفته', duration: '۱۲:۴۰', img: 'https://i.pravatar.cc/400?img=15' },
  { id: '2', title: 'اصلاح حرفه‌ای ریش', meta: 'آکادمی نیوباربر · سطح پیشرفته', duration: '۱۹:۲۰', img: 'https://i.pravatar.cc/400?img=12' },
  { id: '3', title: 'مشاوره استایل با مشتری', meta: 'آکادمی نیوباربر · سطح مقدماتی', duration: '۲۶:۴۰', img: 'https://i.pravatar.cc/400?img=68' },
  { id: '4', title: 'بهداشت ابزار و محیط', meta: 'آکادمی نیوباربر · سطح مقدماتی', duration: '۳۳:۴۰', img: 'https://i.pravatar.cc/400?img=33' },
];

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [IonContent, IonIcon],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap training-wrap" dir="rtl">
        <div class="training-head">
          <h1>آموزش حرفه‌ای</h1>
          <p>مهارت‌های خود را به‌روز نگه دارید</p>
        </div>
        <div class="training-grid">
          @for (t of items; track t.id) {
            <button type="button" class="training-card" (click)="playItem(t)">
              <span class="tc-media">
                <img [src]="t.img" [alt]="t.title" loading="lazy" (error)="onImgError($event)" />
                <span class="tc-play" aria-hidden="true"><ion-icon name="play"></ion-icon></span>
                <span class="tc-dur" dir="ltr">{{ t.duration }}</span>
              </span>
              <span class="tc-body">
                <b>{{ t.title }}</b>
                <small>{{ t.meta }}</small>
              </span>
            </button>
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .training-wrap { gap: 18px; padding-top: 12px; }
    .training-head { text-align: right; }
    .training-head h1 { margin: 0; font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .training-head p { margin: 6px 0 0; font-size: 11px; color: var(--text-secondary); }
    .training-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; width: 100%; }
    @media (max-width: 900px) { .training-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px) { .training-grid { grid-template-columns: 1fr; } }
    .training-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      padding: 0;
      display: flex;
      flex-direction: column;
      text-align: right;
      cursor: pointer;
      transition: border-color 0.15s, transform 0.15s;
      font-family: inherit;
      width: 100%;
    }
    .training-card:hover { border-color: var(--card-border-2); }
    .training-card:active { transform: scale(0.99); }
    .tc-media { position: relative; display: block; width: 100%; aspect-ratio: 16/10; overflow: hidden; background: #1e2a44; }
    .tc-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tc-play {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 44px; height: 44px; border-radius: 999px;
      background: var(--accent); color: var(--accent-contrast);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    }
    .tc-play ion-icon { font-size: 20px; margin-left: -1px; }
    .tc-dur {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(0,0,0,0.72); color: #fff;
      font-size: 11px; font-weight: 700; line-height: 1;
      padding: 4px 6px; border-radius: 6px; direction: ltr;
    }
    .tc-body { display: flex; flex-direction: column; gap: 4px; padding: 12px 12px 14px; align-items: flex-end; width: 100%; box-sizing: border-box; }
    .tc-body b { font-size: 13px; font-weight: 800; color: var(--text-primary); line-height: 1.3; }
    .tc-body small { font-size: 11px; color: var(--text-secondary); line-height: 1.4; }
  `],
})
export class TrainingPage {
  items = ITEMS;
  constructor() { addIcons({ play }); }
  playItem(_t: TrainingItem) {}
  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/400?u=fallback'; }
}

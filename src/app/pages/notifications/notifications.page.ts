import { Component, inject, signal, OnInit } from '@angular/core';
import {
  IonContent,
  IonList,
  IonBadge,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, mailUnreadOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { NotificationItem } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonContent, IonList, IonBadge, IonSpinner, IonCard, IonCardContent, IonIcon, EmptyStateComponent, UiButtonComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap" dir="rtl">
        <div class="section-head">
          <h3>{{ t.title }}</h3>
          <span class="muted"><ion-badge style="--background:var(--accent);--color:var(--accent-contrast)">{{ unread() }}</ion-badge> {{ t.unread }}</span>
        </div>
        <div class="dark-card" style="display:flex;align-items:center;justify-content:space-between;padding:12px">
          <span style="font-size:12px;color:var(--text-primary)">{{ t.title }}</span>
          <app-ui-button size="small" fill="outline" icon="checkmark-done-outline" (pressed)="readAll()">{{ t.markAllRead }}</app-ui-button>
        </div>
        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{ c.loading }}</p></div>
        }
        @if (!loading() && !items().length) {
          <app-empty-state [message]="t.noNotifications" />
        }
        <ion-list lines="none" style="background:transparent;width:100%">
          @for (n of items(); track n.id) {
            <ion-card [style.opacity]="n.isRead ? 0.6 : 1" button (click)="readOne(n.id)" style="margin-bottom:10px">
              <ion-card-content>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
                  <h3 style="margin:0;font-weight:800;font-size:13px;color:var(--text-primary);display:flex;align-items:center;gap:6px">
                    @if (!n.isRead) { <ion-icon name="mail-unread-outline" style="color:var(--accent)"></ion-icon> } {{ n.title }}
                  </h3>
                  @if (!n.isRead) { <ion-badge style="--background:var(--accent);--color:var(--accent-contrast);font-size:10px">{{ t.newBadge }}</ion-badge> }
                </div>
                <p class="muted" style="margin:6px 0 4px">{{ n.body }}</p>
                <p style="font-size:10px;color:var(--text-muted);margin:0">{{ n.type }} · {{ n.createdAt }}</p>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
      </div>
    </ion-content>`,
})
export class NotificationsPage implements OnInit {
  private api = inject(ApiService);
  t = fa.notifications;
  c = fa.common;
  items = signal<NotificationItem[]>([]);
  unread = signal(0);
  loading = signal(false);
  constructor() { addIcons({ checkmarkDoneOutline, mailUnreadOutline }); }
  ngOnInit() { this.load(); this.loadUnread(); }
  load() {
    this.loading.set(true);
    this.api.notifications.list().subscribe({
      next: (v) => { const arr = Array.isArray(v) ? v : ((v as { data: NotificationItem[] }).data ?? []); this.items.set(arr as NotificationItem[]); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  loadUnread() {
    this.api.notifications.unread().subscribe({ next: (v) => { const n = typeof v === 'number' ? v : ((v as { count: number }).count ?? 0); this.unread.set(n); } });
  }
  readAll() { this.api.notifications.readAll().subscribe({ next: () => { this.load(); this.unread.set(0); } }); }
  readOne(id: string) { this.api.notifications.readOne(id).subscribe({ next: () => this.load() }); }
}

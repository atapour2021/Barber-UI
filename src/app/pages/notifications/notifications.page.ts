import { Component, inject, signal, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonBadge, IonSpinner, IonCard, IonCardContent, IonIcon } from '@ionic/angular';
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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonBadge, IonSpinner, IonCard, IonCardContent, IonIcon, EmptyStateComponent, UiButtonComponent],
  template: `
  <ion-header><ion-toolbar><ion-title>{{t.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content [fullscreen]="true">
    <div class="page-wrap">
      <div class="card-modern" style="display:flex;align-items:center;justify-content:space-between">
        <span><ion-badge>{{unread()}}</ion-badge> {{t.unread}}</span>
        <ui-button size="small" fill="outline" icon="checkmark-done-outline" (pressed)="readAll()">{{t.markAllRead}}</ui-button>
      </div>
      @if (loading()) { <div style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{c.loading}}</p></div> }
      @if (!loading() && !items().length) { <app-empty-state [message]="t.noNotifications" /> }
      <ion-list lines="none" style="background:transparent;width:100%">
        @for (n of items(); track n.id) {
          <ion-card [style.opacity]="n.isRead ? .7 : 1" button (click)="readOne(n.id)">
            <ion-card-content>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <h3 style="margin:0;font-weight:700">@if (!n.isRead) { <ion-icon name="mail-unread-outline" style="vertical-align:middle"></ion-icon> } {{n.title}}</h3>
                @if (!n.isRead) { <ion-badge color="primary">{{t.newBadge}}</ion-badge> }
              </div>
              <p class="muted" style="margin:6px 0 4px">{{n.body}}</p>
              <p class="muted" style="font-size:11px">{{n.type}} · {{n.createdAt}}</p>
            </ion-card-content>
          </ion-card>
        }
      </ion-list>
    </div>
  </ion-content>`,
})
export class NotificationsPage implements OnInit {
  private api = inject(ApiService);
  t = fa.notifications; c = fa.common;
  items = signal<NotificationItem[]>([]); unread = signal(0); loading = signal(false);
  constructor() { addIcons({ checkmarkDoneOutline, mailUnreadOutline }); }
  ngOnInit() { this.load(); this.loadUnread(); }
  load() { this.loading.set(true); this.api.notifications.list().subscribe({ next: v => { const arr = Array.isArray(v) ? v : (v as { data: NotificationItem[] }).data ?? []; this.items.set(arr as NotificationItem[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  loadUnread() { this.api.notifications.unread().subscribe({ next: v => { const n = typeof v === 'number' ? v : (v as { count: number }).count ?? 0; this.unread.set(n); } }); }
  readAll() { this.api.notifications.readAll().subscribe({ next: () => { this.load(); this.unread.set(0); } }); }
  readOne(id: string) { this.api.notifications.readOne(id).subscribe({ next: () => this.load() }); }
}

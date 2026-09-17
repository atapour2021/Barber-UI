import { Component, inject, signal, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonBadge, IonSpinner, IonText } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { NotificationItem } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonBadge, IonSpinner, IonText],
  template: `
  <ion-header><ion-toolbar><ion-title>Notifications</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-button size="small" (click)="readAll()">Mark all read</ion-button>
    <span style="margin-left:12px"><ion-badge>{{unread()}}</ion-badge> unread</span>
    @if (loading()) { <div style="text-align:center"><ion-spinner/></div> }
    <ion-list>
      @for (n of items(); track n.id) {
        <ion-item [color]="n.isRead ? '' : 'light'" (click)="readOne(n.id)">
          <ion-label><h3>{{n.title}}</h3><p>{{n.body}}</p><p style="font-size:11px">{{n.type}} · {{n.createdAt}}</p></ion-label>
          @if (!n.isRead) { <ion-badge color="primary">new</ion-badge> }
        </ion-item>
      }
      @if (!items().length && !loading()) { <ion-text color="medium"><p>No notifications</p></ion-text> }
    </ion-list>
  </ion-content>`,
})
export class NotificationsPage implements OnInit {
  private api = inject(ApiService);
  items = signal<NotificationItem[]>([]); unread = signal(0); loading = signal(false);
  ngOnInit() { this.load(); this.loadUnread(); }
  load() { this.loading.set(true); this.api.notifications.list().subscribe({ next: v => { const arr = Array.isArray(v) ? v : (v as { data: NotificationItem[] }).data ?? []; this.items.set(arr as NotificationItem[]); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  loadUnread() { this.api.notifications.unread().subscribe({ next: v => { const n = typeof v === 'number' ? v : (v as { count: number }).count ?? 0; this.unread.set(n); } }); }
  readAll() { this.api.notifications.readAll().subscribe({ next: () => { this.load(); this.unread.set(0); } }); }
  readOne(id: string) { this.api.notifications.readOne(id).subscribe({ next: () => this.load() }); }
}

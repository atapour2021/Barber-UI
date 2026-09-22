import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationItem, Paginated } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list(params?: Record<string, unknown>) {
    return this.http.get<NotificationItem[] | Paginated<NotificationItem>>(
      `${this.b}/notifications`,
      { params: toParams(params) },
    );
  }
  unread() {
    return this.http.get<{ count: number } | number>(`${this.b}/notifications/unread-count`);
  }
  readAll() {
    return this.http.patch(`${this.b}/notifications/read-all`, {});
  }
  readOne(id: string) {
    return this.http.patch(`${this.b}/notifications/${id}/read`, {});
  }
}

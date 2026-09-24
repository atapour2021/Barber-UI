import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, UserPreferences } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  me() {
    return this.http.get<User>(`${this.b}/users/me`);
  }
  updateMe(dto: Record<string, unknown>) {
    return this.http.patch<User>(`${this.b}/users/me`, dto);
  }
  uploadAvatar(fd: FormData) {
    return this.http.post<User>(`${this.b}/users/me/avatar`, fd);
  }
  getPreferences() {
    return this.http.get<UserPreferences>(`${this.b}/users/me/preferences`);
  }
  updatePreferences(dto: Partial<UserPreferences>) {
    return this.http.patch<UserPreferences>(`${this.b}/users/me/preferences`, dto);
  }
}

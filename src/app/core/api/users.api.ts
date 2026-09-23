import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserPreferences } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  getPreferences() {
    return this.http.get<UserPreferences>(`${this.b}/users/me/preferences`);
  }
  updatePreferences(dto: Partial<UserPreferences>) {
    return this.http.patch<UserPreferences>(`${this.b}/users/me/preferences`, dto);
  }
}

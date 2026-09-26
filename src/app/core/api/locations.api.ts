import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Location } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class LocationsApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list(params?: Record<string, unknown>) {
    return this.http.get<Location[]>(`${this.b}/locations`, { params: toParams(params) });
  }
  myAddresses(params?: Record<string, unknown>) {
    return this.http.get<Location[] | { data: Location[]; meta: { total: number; page: number; limit: number } }>(`${this.b}/locations/me`, {
      params: toParams(params),
    });
  }
  byBarber(barberId: string) {
    return this.http.get<Location>(`${this.b}/locations/barber/${barberId}`);
  }
  get(id: string) {
    return this.http.get<Location>(`${this.b}/locations/${id}`);
  }
  create(dto: Record<string, unknown>) {
    return this.http.post<Location>(`${this.b}/locations`, dto);
  }
  update(id: string, dto: Record<string, unknown>) {
    return this.http.patch<Location>(`${this.b}/locations/${id}`, dto);
  }
  remove(id: string) {
    return this.http.delete(`${this.b}/locations/${id}`);
  }
}

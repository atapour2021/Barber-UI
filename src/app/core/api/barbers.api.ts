import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Barber } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class BarbersApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list(params?: Record<string, unknown>) {
    return this.http.get<Barber[]>(`${this.b}/barbers`, { params: toParams(params) });
  }
  me() {
    return this.http.get<Barber>(`${this.b}/barbers/me`);
  }
  get(id: string) {
    return this.http.get<Barber>(`${this.b}/barbers/${id}`);
  }
  create(dto: Record<string, unknown>) {
    return this.http.post<Barber>(`${this.b}/barbers`, dto);
  }
  update(id: string, dto: Record<string, unknown>) {
    return this.http.patch<Barber>(`${this.b}/barbers/${id}`, dto);
  }
  remove(id: string) {
    return this.http.delete(`${this.b}/barbers/${id}`);
  }
}

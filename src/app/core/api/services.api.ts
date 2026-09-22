import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Service } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class ServicesApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list(params?: Record<string, unknown>) {
    return this.http.get<Service[]>(`${this.b}/services`, { params: toParams(params) });
  }
  get(id: string) {
    return this.http.get<Service>(`${this.b}/services/${id}`);
  }
  create(dto: Record<string, unknown>) {
    return this.http.post<Service>(`${this.b}/services`, dto);
  }
  update(id: string, dto: Record<string, unknown>) {
    return this.http.patch<Service>(`${this.b}/services/${id}`, dto);
  }
  remove(id: string) {
    return this.http.delete(`${this.b}/services/${id}`);
  }
}

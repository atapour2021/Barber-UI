import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Certificate } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class CertificatesApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list(params?: Record<string, unknown>) {
    return this.http.get<Certificate[]>(`${this.b}/certificates`, { params: toParams(params) });
  }
  get(id: string) {
    return this.http.get<Certificate>(`${this.b}/certificates/${id}`);
  }
  create(dto: Record<string, unknown>) {
    return this.http.post<Certificate>(`${this.b}/certificates`, dto);
  }
  update(id: string, dto: Record<string, unknown>) {
    return this.http.patch<Certificate>(`${this.b}/certificates/${id}`, dto);
  }
  remove(id: string) {
    return this.http.delete(`${this.b}/certificates/${id}`);
  }
}

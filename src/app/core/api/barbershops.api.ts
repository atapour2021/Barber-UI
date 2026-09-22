import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Barbershop } from '../models';

@Injectable({ providedIn: 'root' })
export class BarbershopsApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list() {
    return this.http.get<Barbershop[]>(`${this.b}/barbershops`);
  }
  get(id: string) {
    return this.http.get<Barbershop>(`${this.b}/barbershops/${id}`);
  }
  create(dto: Record<string, unknown>) {
    return this.http.post<Barbershop>(`${this.b}/barbershops`, dto);
  }
  update(id: string, dto: Record<string, unknown>) {
    return this.http.patch<Barbershop>(`${this.b}/barbershops/${id}`, dto);
  }
  remove(id: string) {
    return this.http.delete(`${this.b}/barbershops/${id}`);
  }
}

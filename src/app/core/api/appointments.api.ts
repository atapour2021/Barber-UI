import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Appointment, AvailabilityResponse } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class AppointmentsApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;

  availableSlots(params: Record<string, string>) {
    return this.http.get<AvailabilityResponse | { slots?: unknown[] }>(
      `${this.b}/appointments/available-slots`,
      { params: toParams(params) },
    );
  }

  list(params?: Record<string, unknown>) {
    return this.http.get<Appointment[]>(`${this.b}/appointments`, { params: toParams(params) });
  }

  get(id: string) {
    return this.http.get<Appointment>(`${this.b}/appointments/${id}`);
  }

  create(dto: Record<string, unknown>) {
    return this.http.post<Appointment>(`${this.b}/appointments`, dto);
  }

  update(id: string, dto: Record<string, unknown>) {
    return this.http.patch<Appointment>(`${this.b}/appointments/${id}`, dto);
  }

  cancel(id: string) {
    return this.http.post<Appointment | { status: string }>(`${this.b}/appointments/${id}/cancel`, {});
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<Appointment>(`${this.b}/appointments/${id}/status`, { status });
  }

  remove(id: string) {
    return this.http.delete(`${this.b}/appointments/${id}`);
  }
}

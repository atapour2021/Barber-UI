import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Appointment, Barbershop, Barber, Service, Educational, Certificate, Location, NotificationItem, Paginated, DashboardData, Setting } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  private q(p?: Record<string, unknown>) {
    let hp = new HttpParams();
    if (p) Object.entries(p).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v)); });
    return hp;
  }

  barbershops = {
    list: () => this.http.get<Barbershop[]>(`${this.b}/barbershops`),
    get: (id: string) => this.http.get<Barbershop>(`${this.b}/barbershops/${id}`),
    create: (d: unknown) => this.http.post<Barbershop>(`${this.b}/barbershops`, d),
    update: (id: string, d: unknown) => this.http.patch<Barbershop>(`${this.b}/barbershops/${id}`, d),
    remove: (id: string) => this.http.delete(`${this.b}/barbershops/${id}`),
  };
  barbers = {
    list: (p?: Record<string, unknown>) => this.http.get<Barber[]>(`${this.b}/barbers`, { params: this.q(p) }),
    me: () => this.http.get<Barber>(`${this.b}/barbers/me`),
    get: (id: string) => this.http.get<Barber>(`${this.b}/barbers/${id}`),
    create: (d: unknown) => this.http.post<Barber>(`${this.b}/barbers`, d),
    update: (id: string, d: unknown) => this.http.patch<Barber>(`${this.b}/barbers/${id}`, d),
    remove: (id: string) => this.http.delete(`${this.b}/barbers/${id}`),
  };
  services = {
    list: (p?: Record<string, unknown>) => this.http.get<Service[]>(`${this.b}/services`, { params: this.q(p) }),
    get: (id: string) => this.http.get<Service>(`${this.b}/services/${id}`),
    create: (d: unknown) => this.http.post<Service>(`${this.b}/services`, d),
    update: (id: string, d: unknown) => this.http.patch<Service>(`${this.b}/services/${id}`, d),
    remove: (id: string) => this.http.delete(`${this.b}/services/${id}`),
  };
  appointments = {
    slots: (p: Record<string, string>) => this.http.get<unknown>(`${this.b}/appointments/available-slots`, { params: this.q(p) }),
    list: (p?: Record<string, unknown>) => this.http.get<Appointment[]>(`${this.b}/appointments`, { params: this.q(p) }),
    get: (id: string) => this.http.get<Appointment>(`${this.b}/appointments/${id}`),
    create: (d: unknown) => this.http.post<Appointment>(`${this.b}/appointments`, d),
    update: (id: string, d: unknown) => this.http.patch<Appointment>(`${this.b}/appointments/${id}`, d),
    cancel: (id: string) => this.http.post(`${this.b}/appointments/${id}/cancel`, {}),
    status: (id: string, status: string) => this.http.patch(`${this.b}/appointments/${id}/status`, { status }),
    remove: (id: string) => this.http.delete(`${this.b}/appointments/${id}`),
  };
  availability = {
    get: (p: Record<string, string>) => this.http.get<unknown>(`${this.b}/availability`, { params: this.q(p) }),
  };
  educational = {
    list: (p?: Record<string, unknown>) => this.http.get<Educational[]>(`${this.b}/educational`, { params: this.q(p) }),
    get: (id: string) => this.http.get<Educational>(`${this.b}/educational/${id}`),
    create: (fd: FormData) => this.http.post<Educational>(`${this.b}/educational`, fd),
    update: (id: string, fd: FormData) => this.http.patch<Educational>(`${this.b}/educational/${id}`, fd),
    video: (id: string, fd: FormData) => this.http.post<Educational>(`${this.b}/educational/${id}/video`, fd),
    remove: (id: string) => this.http.delete(`${this.b}/educational/${id}`),
  };
  certificates = {
    list: (p?: Record<string, unknown>) => this.http.get<Certificate[]>(`${this.b}/certificates`, { params: this.q(p) }),
    get: (id: string) => this.http.get<Certificate>(`${this.b}/certificates/${id}`),
    create: (d: unknown) => this.http.post<Certificate>(`${this.b}/certificates`, d),
    update: (id: string, d: unknown) => this.http.patch<Certificate>(`${this.b}/certificates/${id}`, d),
    remove: (id: string) => this.http.delete(`${this.b}/certificates/${id}`),
  };
  locations = {
    list: (p?: Record<string, unknown>) => this.http.get<Location[]>(`${this.b}/locations`, { params: this.q(p) }),
    byBarber: (barberId: string) => this.http.get<Location>(`${this.b}/locations/barber/${barberId}`),
    get: (id: string) => this.http.get<Location>(`${this.b}/locations/${id}`),
    create: (d: unknown) => this.http.post<Location>(`${this.b}/locations`, d),
    update: (id: string, d: unknown) => this.http.patch<Location>(`${this.b}/locations/${id}`, d),
    remove: (id: string) => this.http.delete(`${this.b}/locations/${id}`),
  };
  notifications = {
    list: (p?: Record<string, unknown>) => this.http.get<NotificationItem[] | Paginated<NotificationItem>>(`${this.b}/notifications`, { params: this.q(p) }),
    unread: () => this.http.get<{ count: number } | number>(`${this.b}/notifications/unread-count`),
    readAll: () => this.http.patch(`${this.b}/notifications/read-all`, {}),
    readOne: (id: string) => this.http.patch(`${this.b}/notifications/${id}/read`, {}),
  };
  uploads = {
    upload: (fd: FormData) => this.http.post<{ url: string; filename: string } | { file: string }>(`${this.b}/uploads`, fd),
  };
  admin = {
    dashboard: () => this.http.get<DashboardData>(`${this.b}/admin/dashboard`),
    users: (p?: Record<string, unknown>) => this.http.get<Paginated<unknown> | unknown[]>(`${this.b}/admin/users`, { params: this.q(p) }),
    user: (id: string) => this.http.get<unknown>(`${this.b}/admin/users/${id}`),
    updateUser: (id: string, d: unknown) => this.http.patch(`${this.b}/admin/users/${id}`, d),
    deleteUser: (id: string) => this.http.delete(`${this.b}/admin/users/${id}`),
    customers: (p?: Record<string, unknown>) => this.http.get<unknown>(`${this.b}/admin/customers`, { params: this.q(p) }),
    barbers: (p?: Record<string, unknown>) => this.http.get<unknown>(`${this.b}/admin/barbers`, { params: this.q(p) }),
    adminServices: (p?: Record<string, unknown>) => this.http.get<unknown>(`${this.b}/admin/services`, { params: this.q(p) }),
    adminAppointments: (p?: Record<string, unknown>) => this.http.get<unknown>(`${this.b}/admin/appointments`, { params: this.q(p) }),
    reports: (p?: Record<string, unknown>) => this.http.get<unknown>(`${this.b}/admin/reports/summary`, { params: this.q(p) }),
    settings: () => this.http.get<Setting[]>(`${this.b}/admin/settings`),
    createSetting: (d: unknown) => this.http.post<Setting>(`${this.b}/admin/settings`, d),
    updateSetting: (key: string, d: unknown) => this.http.patch<Setting>(`${this.b}/admin/settings/${key}`, d),
    deleteSetting: (key: string) => this.http.delete(`${this.b}/admin/settings/${key}`),
  };
}

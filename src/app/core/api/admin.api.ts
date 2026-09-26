import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardData, Paginated, ReportsSummary, Setting } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;

  dashboard() {
    return this.http.get<DashboardData>(`${this.b}/admin/dashboard`);
  }

  users(params?: Record<string, unknown>) {
    return this.http.get<Paginated<unknown> | unknown[]>(`${this.b}/admin/users`, {
      params: toParams(params),
    });
  }

  user(id: string) {
    return this.http.get<unknown>(`${this.b}/admin/users/${id}`);
  }

  updateUser(id: string, dto: Record<string, unknown>) {
    return this.http.patch(`${this.b}/admin/users/${id}`, dto);
  }

  toggleUserActive(id: string, isActive?: boolean) {
    return this.http.patch(`${this.b}/admin/users/${id}/toggle-active`, isActive === undefined ? {} : { isActive });
  }

  resetUserPassword(id: string, password: string) {
    return this.http.post(`${this.b}/admin/users/${id}/reset-password`, { password });
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.b}/admin/users/${id}`);
  }

  customers(params?: Record<string, unknown>) {
    return this.http.get<unknown>(`${this.b}/admin/customers`, { params: toParams(params) });
  }

  customer(id: string) {
    return this.http.get<unknown>(`${this.b}/admin/customers/${id}`);
  }

  barbers(params?: Record<string, unknown>) {
    return this.http.get<unknown>(`${this.b}/admin/barbers`, { params: toParams(params) });
  }

  barber(id: string) {
    return this.http.get<unknown>(`${this.b}/admin/barbers/${id}`);
  }

  toggleBarberActive(id: string, isActive?: boolean) {
    return this.http.patch(`${this.b}/admin/barbers/${id}/toggle-active`, isActive === undefined ? {} : { isActive });
  }

  resetBarberPassword(id: string, password: string) {
    return this.http.post(`${this.b}/admin/barbers/${id}/reset-password`, { password });
  }

  updateBarber(id: string, dto: Record<string, unknown>) {
    return this.http.patch(`${this.b}/admin/barbers/${id}`, dto);
  }

  deleteBarber(id: string) {
    return this.http.delete(`${this.b}/admin/barbers/${id}`);
  }

  adminServices(params?: Record<string, unknown>) {
    return this.http.get<unknown>(`${this.b}/admin/services`, { params: toParams(params) });
  }

  adminService(id: string) {
    return this.http.get<unknown>(`${this.b}/admin/services/${id}`);
  }

  createService(dto: Record<string, unknown>) {
    return this.http.post(`${this.b}/admin/services`, dto);
  }

  updateService(id: string, dto: Record<string, unknown>) {
    return this.http.patch(`${this.b}/admin/services/${id}`, dto);
  }

  deleteService(id: string) {
    return this.http.delete(`${this.b}/admin/services/${id}`);
  }

  adminAppointments(params?: Record<string, unknown>) {
    return this.http.get<unknown>(`${this.b}/admin/appointments`, { params: toParams(params) });
  }

  adminAppointment(id: string) {
    return this.http.get<unknown>(`${this.b}/admin/appointments/${id}`);
  }

  updateAppointmentStatus(id: string, status: string) {
    return this.http.patch(`${this.b}/admin/appointments/${id}/status`, { status });
  }

  cancelAppointment(id: string) {
    return this.http.post(`${this.b}/admin/appointments/${id}/cancel`, {});
  }

  updateAppointment(id: string, dto: Record<string, unknown>) {
    return this.http.patch(`${this.b}/admin/appointments/${id}`, dto);
  }

  deleteAppointment(id: string) {
    return this.http.delete(`${this.b}/admin/appointments/${id}`);
  }

  reports(params?: Record<string, unknown>) {
    return this.http.get<ReportsSummary | unknown>(`${this.b}/admin/reports/summary`, {
      params: toParams(params),
    });
  }

  settings() {
    return this.http.get<Setting[]>(`${this.b}/admin/settings`);
  }

  setting(key: string) {
    return this.http.get<Setting>(`${this.b}/admin/settings/${key}`);
  }

  createSetting(dto: Record<string, unknown>) {
    return this.http.post<Setting>(`${this.b}/admin/settings`, dto);
  }

  updateSetting(key: string, dto: Record<string, unknown>) {
    return this.http.patch<Setting>(`${this.b}/admin/settings/${key}`, dto);
  }

  deleteSetting(key: string) {
    return this.http.delete(`${this.b}/admin/settings/${key}`);
  }
}

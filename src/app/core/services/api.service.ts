import { Injectable, inject } from '@angular/core';
import { BarbershopsApi } from '../api/barbershops.api';
import { BarbersApi } from '../api/barbers.api';
import { ServicesApi } from '../api/services.api';
import { AppointmentsApi } from '../api/appointments.api';
import { AvailabilityApi } from '../api/availability.api';
import { EducationalApi } from '../api/educational.api';
import { CertificatesApi } from '../api/certificates.api';
import { LocationsApi } from '../api/locations.api';
import { NotificationsApi } from '../api/notifications.api';
import { UploadsApi } from '../api/uploads.api';
import { AdminApi } from '../api/admin.api';
import { UsersApi } from '../api/users.api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private barbershopsApi = inject(BarbershopsApi);
  private barbersApi = inject(BarbersApi);
  private servicesApi = inject(ServicesApi);
  private appointmentsApi = inject(AppointmentsApi);
  private availabilityApi = inject(AvailabilityApi);
  private educationalApi = inject(EducationalApi);
  private certificatesApi = inject(CertificatesApi);
  private locationsApi = inject(LocationsApi);
  private notificationsApi = inject(NotificationsApi);
  private uploadsApi = inject(UploadsApi);
  private adminApi = inject(AdminApi);
  private usersApi = inject(UsersApi);

  barbershops = {
    list: () => this.barbershopsApi.list(),
    get: (id: string) => this.barbershopsApi.get(id),
    create: (d: Record<string, unknown>) => this.barbershopsApi.create(d),
    update: (id: string, d: Record<string, unknown>) => this.barbershopsApi.update(id, d),
    remove: (id: string) => this.barbershopsApi.remove(id),
  };
  barbers = {
    list: (p?: Record<string, unknown>) => this.barbersApi.list(p),
    me: () => this.barbersApi.me(),
    updateMe: (d: Record<string, unknown>) => this.barbersApi.updateMe(d),
    uploadMyAvatar: (fd: FormData) => this.barbersApi.uploadMyAvatar(fd),
    uploadAvatar: (id: string, fd: FormData) => this.barbersApi.uploadAvatar(id, fd),
    get: (id: string) => this.barbersApi.get(id),
    create: (d: Record<string, unknown>) => this.barbersApi.create(d),
    update: (id: string, d: Record<string, unknown>) => this.barbersApi.update(id, d),
    remove: (id: string) => this.barbersApi.remove(id),
  };
  services = {
    list: (p?: Record<string, unknown>) => this.servicesApi.list(p),
    get: (id: string) => this.servicesApi.get(id),
    create: (d: Record<string, unknown>) => this.servicesApi.create(d),
    update: (id: string, d: Record<string, unknown>) => this.servicesApi.update(id, d),
    remove: (id: string) => this.servicesApi.remove(id),
  };
  appointments = {
    slots: (p: Record<string, string>) => this.appointmentsApi.availableSlots(p),
    list: (p?: Record<string, unknown>) => this.appointmentsApi.list(p),
    get: (id: string) => this.appointmentsApi.get(id),
    create: (d: Record<string, unknown>) => this.appointmentsApi.create(d),
    update: (id: string, d: Record<string, unknown>) => this.appointmentsApi.update(id, d),
    cancel: (id: string) => this.appointmentsApi.cancel(id),
    status: (id: string, status: string) => this.appointmentsApi.updateStatus(id, status),
    remove: (id: string) => this.appointmentsApi.remove(id),
  };
  availability = {
    get: (p: Record<string, string>) => this.availabilityApi.get(p),
  };
  educational = {
    list: (p?: Record<string, unknown>) => this.educationalApi.list(p),
    get: (id: string) => this.educationalApi.get(id),
    create: (fd: FormData) => this.educationalApi.create(fd),
    update: (id: string, fd: FormData) => this.educationalApi.update(id, fd),
    video: (id: string, fd: FormData) => this.educationalApi.video(id, fd),
    remove: (id: string) => this.educationalApi.remove(id),
  };
  certificates = {
    list: (p?: Record<string, unknown>) => this.certificatesApi.list(p),
    get: (id: string) => this.certificatesApi.get(id),
    create: (d: Record<string, unknown>) => this.certificatesApi.create(d),
    update: (id: string, d: Record<string, unknown>) => this.certificatesApi.update(id, d),
    remove: (id: string) => this.certificatesApi.remove(id),
  };
  locations = {
    list: (p?: Record<string, unknown>) => this.locationsApi.list(p),
    myAddresses: () => this.locationsApi.myAddresses(),
    byBarber: (barberId: string) => this.locationsApi.byBarber(barberId),
    get: (id: string) => this.locationsApi.get(id),
    create: (d: Record<string, unknown>) => this.locationsApi.create(d),
    update: (id: string, d: Record<string, unknown>) => this.locationsApi.update(id, d),
    remove: (id: string) => this.locationsApi.remove(id),
  };
  notifications = {
    list: (p?: Record<string, unknown>) => this.notificationsApi.list(p),
    unread: () => this.notificationsApi.unread(),
    readAll: () => this.notificationsApi.readAll(),
    readOne: (id: string) => this.notificationsApi.readOne(id),
  };
  uploads = {
    upload: (fd: FormData) => this.uploadsApi.upload(fd),
  };
  admin = {
    dashboard: () => this.adminApi.dashboard(),
    users: (p?: Record<string, unknown>) => this.adminApi.users(p),
    user: (id: string) => this.adminApi.user(id),
    updateUser: (id: string, d: Record<string, unknown>) => this.adminApi.updateUser(id, d),
    deleteUser: (id: string) => this.adminApi.deleteUser(id),
    customers: (p?: Record<string, unknown>) => this.adminApi.customers(p),
    customer: (id: string) => this.adminApi.customer(id),
    barbers: (p?: Record<string, unknown>) => this.adminApi.barbers(p),
    barber: (id: string) => this.adminApi.barber(id),
    adminServices: (p?: Record<string, unknown>) => this.adminApi.adminServices(p),
    adminService: (id: string) => this.adminApi.adminService(id),
    createService: (d: Record<string, unknown>) => this.adminApi.createService(d),
    updateService: (id: string, d: Record<string, unknown>) => this.adminApi.updateService(id, d),
    deleteService: (id: string) => this.adminApi.deleteService(id),
    adminAppointments: (p?: Record<string, unknown>) => this.adminApi.adminAppointments(p),
    adminAppointment: (id: string) => this.adminApi.adminAppointment(id),
    updateAppointmentStatus: (id: string, status: string) => this.adminApi.updateAppointmentStatus(id, status),
    cancelAppointment: (id: string) => this.adminApi.cancelAppointment(id),
    deleteAppointment: (id: string) => this.adminApi.deleteAppointment(id),
    reports: (p?: Record<string, unknown>) => this.adminApi.reports(p),
    settings: () => this.adminApi.settings(),
    setting: (key: string) => this.adminApi.setting(key),
    createSetting: (d: Record<string, unknown>) => this.adminApi.createSetting(d),
    updateSetting: (key: string, d: Record<string, unknown>) => this.adminApi.updateSetting(key, d),
    deleteSetting: (key: string) => this.adminApi.deleteSetting(key),
  };
  users = {
    me: () => this.usersApi.me(),
    updateMe: (d: Record<string, unknown>) => this.usersApi.updateMe(d),
    uploadAvatar: (fd: FormData) => this.usersApi.uploadAvatar(fd),
    preferences: () => this.usersApi.getPreferences(),
    updatePreferences: (dto: Record<string, unknown>) => this.usersApi.updatePreferences(dto as never),
  };
}

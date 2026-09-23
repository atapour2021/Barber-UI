export type Role = 'user' | 'customer' | 'barber' | 'admin' | 'super_admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export interface User {
  id: string;
  nationalCode: string;
  name: string;
  family: string;
  username: string;
  phoneNumber: string;
  email?: string | null;
  profileImage?: string | null;
  role: string;
  isActive: boolean;
  themePreference?: string | null;
  smsReminder?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface UserPreferences {
  themePreference: string;
  smsReminder: boolean;
}
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}
export interface Barbershop {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string | null;
  logo?: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface BarberServiceLink {
  id: string;
  price: number;
  duration: number;
  service: Service;
  serviceId?: string;
  barberId?: string;
}
export interface Barber {
  id: string;
  fullName: string;
  bio?: string | null;
  profileImage?: string | null;
  specialties?: string[] | null;
  workingDays?: string[] | null;
  workingHours?: Record<string, { start: string; end: string }> | null;
  breakTime?: unknown;
  holidays?: string[] | null;
  status: string;
  isAvailable: boolean;
  isActive: boolean;
  barbershopId: string;
  userId: string;
  barbershop?: Barbershop;
  user?: User;
  barberServices?: BarberServiceLink[];
  createdAt?: string;
  updatedAt?: string;
}
export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  icon?: string | null;
  barberId: string;
  barbershopId?: string | null;
  barber?: Barber;
  barbershop?: Barbershop;
  createdAt?: string;
  updatedAt?: string;
}
export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  userId: string;
  barberId: string;
  serviceId: string;
  user?: User;
  barber?: Barber;
  service?: Service;
  createdAt?: string;
  updatedAt?: string;
}
export interface Slot {
  time: string;
  startTime: string;
  endTime: string;
  status: string;
}
export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  status: string;
}
export interface AvailabilityResponse {
  date: string;
  barberId: string;
  serviceId: string | null;
  duration?: number;
  workingHours: { start: string; end: string } | null;
  breakTime: { start: string; end: string } | null;
  slots: Slot[];
  reason?: string | null;
}
export interface Educational {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  videoFilename?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  barberId: string;
  startDate?: string | null;
  barber?: Barber;
  createdAt?: string;
}
export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  barberId: string;
  barber?: Barber;
  createdAt?: string;
}
export interface Location {
  id: string;
  address: string;
  label?: string | null;
  latitude: number;
  longitude: number;
  mapMetadata?: Record<string, unknown> | null;
  barberId?: string | null;
  userId?: string | null;
  barber?: Barber;
  createdAt?: string;
  updatedAt?: string;
}
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  appointmentId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  userId?: string;
}
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages?: number;
}
export interface NotificationPaginated {
  items: NotificationItem[];
  total: number;
  page: number;
  limit: number;
}
export interface DashboardData {
  totalUsers: number;
  totalCustomers?: number;
  totalBarbers: number;
  activeBarbers?: number;
  totalAppointments: number;
  totalBarbershops: number;
  totalServices?: number;
  appointmentsByStatus: Record<string, number>;
  pending?: number;
  confirmed?: number;
  completed?: number;
  cancelled?: number;
  todayAppointments?: number;
  revenue?: number;
  recentAppointments?: Appointment[];
}
export interface ReportsSummary {
  total: number;
  byStatus: Record<string, number>;
  revenue: number;
  byDay: Record<string, number>;
  topBarbers: { barberId: string; count: number }[];
}
export interface Setting {
  id: string;
  key: string;
  value?: string | null;
  description?: string | null;
}

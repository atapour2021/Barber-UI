import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('../pages/appointments/appointments.page').then(
            (m) => m.AppointmentsPage,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../pages/notifications/notifications.page').then(
            (m) => m.NotificationsPage,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'services',
        loadComponent: () =>
          import('../pages/services/services.page').then((m) => m.ServicesPage),
      },
      {
        path: 'booking',
        loadComponent: () =>
          import('../pages/booking/booking.page').then((m) => m.BookingPage),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [authGuard],
      },
      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
];

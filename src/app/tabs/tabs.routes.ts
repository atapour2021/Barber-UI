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
        path: 'appointment',
        loadComponent: () =>
          import('../pages/appointment/appointment.page').then((m) => m.AppointmentPage),
        canActivate: [authGuard],
      },
      {
        path: 'appointment/new',
        loadComponent: () =>
          import('../pages/appointment/appointment-create.page').then((m) => m.AppointmentCreatePage),
        canActivate: [authGuard],
      },
      {
        path: 'appointment/:id',
        loadComponent: () =>
          import('../pages/appointment/appointment-detail.page').then((m) => m.AppointmentDetailPage),
        canActivate: [authGuard],
      },
      {
        path: 'turns',
        redirectTo: 'appointment',
        pathMatch: 'full',
      },
      {
        path: 'appointments',
        redirectTo: 'appointment',
        pathMatch: 'full',
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
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('../pages/profile/profile-edit.page').then((m) => m.ProfileEditPage),
        canActivate: [authGuard],
      },
      {
        path: 'profile/change-password',
        loadComponent: () =>
          import('../pages/profile/change-password.page').then((m) => m.ChangePasswordPage),
        canActivate: [authGuard],
      },
      {
        path: 'account',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [authGuard],
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('../pages/addresses/addresses.page').then(
            (m) => m.AddressesPage,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'training',
        loadComponent: () =>
          import('../pages/training/training.page').then((m) => m.TrainingPage),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('../pages/documents/documents.page').then((m) => m.DocumentsPage),
        canActivate: [authGuard],
      },
      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
];

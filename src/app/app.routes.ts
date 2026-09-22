import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/auth/landing.page').then((m) => m.LandingPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login.page').then((m) => m.LoginPage),
        canActivate: [guestGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register.page').then((m) => m.RegisterPage),
        canActivate: [guestGuard],
      },
      {
        path: 'forgot',
        loadComponent: () =>
          import('./pages/auth/forgot.page').then((m) => m.ForgotPage),
        canActivate: [guestGuard],
      },
      {
        path: 'reset',
        loadComponent: () =>
          import('./pages/auth/reset.page').then((m) => m.ResetPage),
        canActivate: [guestGuard],
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/app-layout/app-layout').then(
        (m) => m.AppLayoutComponent,
      ),
    children: [
      {
        path: 'barbershops',
        loadComponent: () =>
          import('./pages/barbershops/barbershops.page').then(
            (m) => m.BarbershopsPage,
          ),
      },
      {
        path: 'barbers',
        loadComponent: () =>
          import('./pages/barbers/barbers.page').then((m) => m.BarbersPage),
      },
      {
        path: 'barbers/:id',
        loadComponent: () =>
          import('./pages/barber-detail/barber-detail.page').then(
            (m) => m.BarberDetailPage,
          ),
      },
      {
        path: 'barber/:id/manage',
        loadComponent: () =>
          import('./pages/barber-detail/barber-manage.page').then(
            (m) => m.BarberManagePage,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services/services.page').then((m) => m.ServicesPage),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/appointments/appointments.page').then(
            (m) => m.AppointmentsPage,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.page').then(
            (m) => m.NotificationsPage,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [authGuard],
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./pages/admin/admin.page').then((m) => m.AdminPage),
        canActivate: [adminGuard],
      },
      {
        path: 'training',
        loadComponent: () =>
          import('./pages/training/training.page').then((m) => m.TrainingPage),
      },
    ],
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];

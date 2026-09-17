import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const a = inject(AuthService); const r = inject(Router);
  return a.isLoggedIn() ? true : r.createUrlTree(['/login']);
};
export const guestGuard: CanActivateFn = () => {
  const a = inject(AuthService); const r = inject(Router);
  return a.isLoggedIn() ? r.createUrlTree(['/tabs/home']) : true;
};
export const adminGuard: CanActivateFn = () => {
  const a = inject(AuthService); const r = inject(Router);
  if (!a.isLoggedIn()) return r.createUrlTree(['/login']);
  return a.isAdmin() ? true : r.createUrlTree(['/tabs/home']);
};
export const barberGuard: CanActivateFn = () => {
  const a = inject(AuthService); const r = inject(Router);
  if (!a.isLoggedIn()) return r.createUrlTree(['/login']);
  return (a.isBarber() || a.isAdmin()) ? true : r.createUrlTree(['/tabs/home']);
};

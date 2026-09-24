import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

function isAuthUrl(url: string): boolean {
  return url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');
}

function failAndRedirect(auth: AuthService, router: Router, err: unknown) {
  isRefreshing = false;
  refreshSubject.next(null);
  auth.clear();
  router.navigateByUrl('/login');
  return throwError(() => err);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  let token: string | null = null;
  try { token = localStorage.getItem('access_token'); } catch {}
  const clone = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(clone).pipe(
    catchError((err) => {
      if (err.status !== 401 || isAuthUrl(req.url)) return throwError(() => err);

      if (!isRefreshing) {
        isRefreshing = true;
        refreshSubject.next(null);
        let rt: string | null = null;
        try { rt = localStorage.getItem('refresh_token'); } catch {}
        if (!rt) return failAndRedirect(auth, router, err);

        return auth.refresh().pipe(
          switchMap((r) => {
            isRefreshing = false;
            refreshSubject.next(r.access_token);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${r.access_token}` } }));
          }),
          catchError((e) => failAndRedirect(auth, router, e)),
        );
      }

      return refreshSubject.pipe(
        filter((v) => v !== null || !isRefreshing),
        take(1),
        switchMap((nt) => {
          if (!nt) return throwError(() => err);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${nt}` } }));
        }),
      );
    }),
  );
};

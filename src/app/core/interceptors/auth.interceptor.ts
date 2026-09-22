import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

function isAuthUrl(url: string): boolean {
  return (
    url.includes('/auth/refresh') ||
    url.includes('/auth/login') ||
    url.includes('/auth/register')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const t = localStorage.getItem('access_token');
  const clone = t
    ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })
    : req;
  return next(clone).pipe(
    catchError((err) => {
      if (err.status !== 401 || isAuthUrl(req.url)) {
        return throwError(() => err);
      }
      if (!isRefreshing) {
        isRefreshing = true;
        refreshSubject.next(null);
        const rt = localStorage.getItem('refresh_token');
        if (!rt) {
          isRefreshing = false;
          auth.clear();
          return throwError(() => err);
        }
        return auth.refresh().pipe(
          switchMap((r) => {
            isRefreshing = false;
            refreshSubject.next(r.access_token);
            return next(
              req.clone({ setHeaders: { Authorization: `Bearer ${r.access_token}` } }),
            );
          }),
          catchError((e) => {
            isRefreshing = false;
            refreshSubject.next(null);
            auth.clear();
            try {
              inject(Router).navigateByUrl('/login');
            } catch {}
            return throwError(() => e);
          }),
        );
      }
      return refreshSubject.pipe(
        filter((v) => v !== null),
        take(1),
        switchMap((nt) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${nt}` } })),
        ),
      );
    }),
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const t = localStorage.getItem('access_token');
  const clone = t ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req;
  return next(clone).pipe(catchError(err => {
    if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      const rt = localStorage.getItem('refresh_token');
      if (!rt) { auth.clear(); return throwError(() => err); }
      return auth.refresh().pipe(switchMap(r => {
        const nt = r.access_token;
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${nt}` } }));
      }), catchError(e => { auth.clear(); return throwError(() => e); }));
    }
    return throwError(() => err);
  }));
};

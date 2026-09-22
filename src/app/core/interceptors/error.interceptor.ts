import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { extractMessage } from '../utils/error';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err) => {
      if (
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register')
      )
        return throwError(() => err);
      if (err.status === 401) return throwError(() => err);
      const msg = extractMessage(err, '');
      if (msg) console.error('[API Error]', req.url, msg, err);
      else console.error('[API Error]', req.url, err);
      return throwError(() => err);
    }),
  );

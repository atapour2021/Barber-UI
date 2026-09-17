import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { extractMessage } from '../utils/error';
import { fa } from '../i18n/fa';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err) => {
      if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return throwError(() => err);
      }
      if (err.status === 401) return throwError(() => err);
      const msg = extractMessage(err, fa.errors.generic);
      inject(ToastService).error(msg);
      return throwError(() => err);
    })
  );

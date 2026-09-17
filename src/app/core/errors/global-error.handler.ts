import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { fa } from '../i18n/fa';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toast = inject(ToastService);
  handleError(error: unknown): void {
    console.error('[GlobalError]', error);
    const msg = (error as { message?: string })?.message?.trim() ? String((error as { message?: string }).message) : fa.errors.generic;
    this.toast.error(msg).catch(() => {});
  }
}

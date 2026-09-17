import { ErrorHandler, Injectable } from '@angular/core';
import { extractMessage } from '../utils/error';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('[GlobalError]', error);
    const msg = extractMessage(error as Record<string, unknown> as never);
    console.error('[GlobalError:msg]', msg);
  }
}

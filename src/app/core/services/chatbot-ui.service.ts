import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ChatbotUiService {
  open = signal(false);
  toggle() { this.open.update((v) => !v); }
  set(v: boolean) { this.open.set(v); }
  clear() { this.open.set(false); }
}

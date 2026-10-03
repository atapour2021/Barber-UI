import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChatLink { label: string; url: string; }
export interface ChatReply {
  answer: string;
  reply: string;
  intent: string;
  links: ChatLink[];
  suggestions: string[];
  quickReplies: string[];
  role: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  ask(message: string, _role?: string, history: Array<{ role: string; text: string }> = []) {
    return this.http.post<ChatReply>(`${this.b}/chat/message`, { message, history });
  }
  faqs(role: string) {
    return this.http.get<{ role: string; items: string[] }>(`${this.b}/chat/faqs`, { params: { role } as never });
  }
}

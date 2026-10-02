import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChatLink { label: string; url: string; }
export interface ChatReply {
  answer: string;
  intent: string;
  links: ChatLink[];
  suggestions: string[];
}

@Injectable({ providedIn: 'root' })
export class ChatbotApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  ask(message: string, role: string) {
    return this.http.post<ChatReply>(`${this.b}/chatbot/ask`, { message, role });
  }
  faqs(role: string) {
    return this.http.get<{ role: string; items: string[] }>(`${this.b}/chatbot/faqs`, { params: { role } });
  }
}
